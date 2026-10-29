import 'server-only';
import {db} from '@/db';
import {activityLogs} from '@/db/schema';

/** Public submissions are logged without personal data, and audit storage cannot break a saved enquiry. */
export async function recordPublicEnquiry(form:string,reference:string){
 try {
  await db.insert(activityLogs).values({
   name:'Received Form Enquiry',status:'CREATE',userId:null,
   newEntry:JSON.stringify({type:'enquiries',user:'Website visitor',details:`${form} saved (${reference})`,entry:{reference,source:form}}),
  });
 } catch(error) {console.error('[enquiry-audit] Could not persist activity log',error);}
}
