import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { AssessmentContent } from "./assessment-content"

async function checkAccess() {
  const cookieStore = await cookies()
  const access = cookieStore.get('dotiq_access')
  return access?.value === 'granted'
}

export default async function AssessmentPage() {
  const hasAccess = await checkAccess()
  
  if (!hasAccess) {
    redirect('/purchase')
  }
  
  return <AssessmentContent />
}
