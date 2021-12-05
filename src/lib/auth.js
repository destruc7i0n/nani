export function isLoggedIn (authState, premium = false) {
  return !authState.guest &&
    authState.user_id &&
    authState.token &&
    !authState.expiredSession &&
    authState.expires &&
    new Date() < new Date(authState.expires) &&
    (premium ? authState.premium : true)
}
