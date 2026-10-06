'use server';

import { db } from '@/db';
import { packageCategories, packages } from '@/db/schema';
import { asc, eq, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { logAdminActivityAction } from '@/actions/activityActions';

export interface PackageCategoryInput {
  name: string;
  type: 'umrah' | 'hajj';
  description?: string;
  displayOrder?: number;
  isPublished?: boolean;
}

export interface PackageCategoryWithCount {
  id: number;
  type: 'umrah' | 'hajj';
  name: string;
  slug: string;
  description: string | null;
  displayOrder: number;
  isPublished: boolean;
  packageCount: number;
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function revalidatePackageCategoryPaths() {
  revalidatePath('/admin/umrah-packages');
  revalidatePath('/admin/hajj-packages');
  revalidatePath('/admin/packages');
  revalidatePath('/umrah-packages');
  revalidatePath('/hajj-packages');
  revalidatePath('/');
}

/** Fetch categories for a package type, each with a count of assigned packages. */
export async function getPackageCategories(type: 'umrah' | 'hajj' = 'umrah'): Promise<PackageCategoryWithCount[]> {
  try {
      const rows = await db
      .select({
        id: packageCategories.id,
        type: packageCategories.type,
        name: packageCategories.name,
        slug: packageCategories.slug,
        description: packageCategories.description,
        displayOrder: packageCategories.displayOrder,
        isPublished: packageCategories.isPublished,
        packageCount: sql<number>`(SELECT COUNT(*) FROM ${packages} WHERE ${packages.categoryId} = ${packageCategories.id})`,
      })
      .from(packageCategories)
      .where(eq(packageCategories.type, type))
      .orderBy(asc(packageCategories.displayOrder), asc(packageCategories.name));

    return (rows || []).map((row) => ({ ...row, packageCount: Number(row.packageCount) || 0 }));
  } catch (err) {
    console.error('getPackageCategories DB error:', err);
    return [];
  }
}

export async function createPackageCategoryAction(input: PackageCategoryInput) {
  const name = (input.name || '').trim();
  if (!name) return { success: false, error: 'Category name is required.' };

  const slug = slugify(name);
  if (!slug) return { success: false, error: 'Category name must contain letters or numbers.' };

  try {
    const inserted = await db
      .insert(packageCategories)
      .values({
        name,
        slug,
        type: input.type || 'umrah',
        description: input.description?.trim() || null,
        displayOrder: Number(input.displayOrder || 0),
        isPublished: input.isPublished !== false,
      })
      .$returningId();

    await logAdminActivityAction({
      type: 'packages',
      action: 'Created Package Category',
      details: `Package category "${name}" created (${input.type || 'umrah'})`,
    });

    revalidatePackageCategoryPaths();
    return { success: true, id: inserted[0]?.id };
  } catch (error: any) {
    if (error?.code === 'ER_DUP_ENTRY') {
      return { success: false, error: 'A category with this name already exists.' };
    }
    console.error('createPackageCategoryAction error:', error);
    return { success: false, error: 'Failed to create package category.' };
  }
}

export async function updatePackageCategoryAction(
  id: number,
  input: { name: string; description?: string; displayOrder?: number; isPublished?: boolean }
) {
  const name = (input.name || '').trim();
  if (!name) return { success: false, error: 'Category name is required.' };

  try {
    const beforeRows = await db.select().from(packageCategories).where(eq(packageCategories.id, id)).limit(1);
    const previousEntry = beforeRows[0] || null;

    await db
      .update(packageCategories)
      .set({
        name,
        slug: slugify(name),
        description: input.description?.trim() || null,
        displayOrder: Number(input.displayOrder || 0),
        isPublished: input.isPublished !== false,
        updatedAt: new Date(),
      })
      .where(eq(packageCategories.id, id));

    const afterRows = await db.select().from(packageCategories).where(eq(packageCategories.id, id)).limit(1);
    await logAdminActivityAction({
      type: 'packages',
      action: 'Updated Package Category',
      details: `Package category "${name}" updated`,
      previousEntry,
      newEntry: afterRows[0] || null,
    });

    revalidatePackageCategoryPaths();
    return { success: true };
  } catch (error: any) {
    if (error?.code === 'ER_DUP_ENTRY') {
      return { success: false, error: 'A category with this name already exists.' };
    }
    console.error('updatePackageCategoryAction error:', error);
    return { success: false, error: 'Failed to update package category.' };
  }
}

export async function deletePackageCategoryAction(id: number) {
  try {
    let categoryName = `ID #${id}`;
    try {
      const found = await db.select().from(packageCategories).where(eq(packageCategories.id, id)).limit(1);
      if (found && found.length > 0) categoryName = `"${found[0].name}"`;
    } catch (e) { }

    await db.delete(packageCategories).where(eq(packageCategories.id, id));

    await logAdminActivityAction({
      type: 'packages',
      action: 'Deleted Package Category',
      details: `Package category ${categoryName} deleted (assigned packages kept, set to uncategorised)`,
    });

    revalidatePackageCategoryPaths();
    return { success: true };
  } catch (error) {
    console.error('deletePackageCategoryAction error:', error);
    return { success: false, error: 'Failed to delete package category.' };
  }
}

export async function updatePackageCategoryOrderAction(orderedIds: number[]) {
  try {
    await Promise.all(
      orderedIds.map((id, index) =>
        db
          .update(packageCategories)
          .set({ displayOrder: index, updatedAt: new Date() })
          .where(eq(packageCategories.id, id))
      )
    );
    revalidatePackageCategoryPaths();
    return { success: true };
  } catch (error) {
    console.error('updatePackageCategoryOrderAction error:', error);
    return { success: false, error: 'Failed to update category order.' };
  }
}

/** Assign (or clear) a category on a single package. */
export async function updatePackageCategoryAssignmentAction(packageId: number, categoryId: number | null) {
  try {
    let pkgTitle = `ID #${packageId}`;
    let categoryName = 'Uncategorised';
    try {
      const found = await db.select().from(packages).where(eq(packages.id, packageId)).limit(1);
      if (found && found.length > 0) pkgTitle = `"${found[0].title}"`;
      if (categoryId) {
        const cat = await db.select().from(packageCategories).where(eq(packageCategories.id, categoryId)).limit(1);
        if (cat && cat.length > 0) categoryName = `"${cat[0].name}"`;
      }
    } catch (e) { }

    await db
      .update(packages)
      .set({ categoryId: categoryId || null, updatedAt: new Date() })
      .where(eq(packages.id, packageId));

    await logAdminActivityAction({
      type: 'packages',
      action: 'Assigned Package Category',
      details: `Package ${pkgTitle} assigned to category ${categoryName}`,
    });

    revalidatePackageCategoryPaths();
    return { success: true };
  } catch (error) {
    console.error('updatePackageCategoryAssignmentAction error:', error);
    return { success: false, error: 'Failed to assign category.' };
  }
}