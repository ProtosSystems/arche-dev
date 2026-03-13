import { AuthenticateWithRedirectCallback } from '@clerk/nextjs'

export default function SsoCallbackPage() {
  return (
    <>
      <AuthenticateWithRedirectCallback signInUrl="/login" signUpUrl="/sign-up" />
      <div id="clerk-captcha" />
    </>
  )
}
