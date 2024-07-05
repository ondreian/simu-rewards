import * as Account from "./account"
import * as SGE from "./sge"
import * as Game from "./game"
import type { GameCode } from "./eaccess/secure"

export {Account, SGE, Game}

export async function claim (account? : string, password? : string, gameCode? : GameCode) {
  if (!account) {
    throw new Error("account was missing")
  }

  if (!password) {
    throw new Error(`password was missing for ${account}`)
  }

  if (!gameCode) {
    throw new Error("game was missing")
  }

  const errors : string[] = []
  const ok     : string[] = []

  try {
    const res = await Account.claimAccountRewards(account, password, gameCode)
    const msg = `${res.account} | balance ${res.message} > ${res.balance}`
    ok.push(msg)
    console.log(msg)
  } catch (err : any) {
    console.log(err)
    errors.push(err.message)
  }
  const characters = await SGE.Secure.listCharacters(account, password, gameCode)
  for (const character of characters) {
    try {
      //console.log("logging in %s", character.name)
      const otp = await SGE.Secure.getOTP(account, password, gameCode, character.name)
      //console.log("received for %s at %s:%s", character.name, otp.host, otp.port)
      const outcome = await Promise.race([
        await Game.useOTP(otp),
        new Promise((_, reject)=> setTimeout(reject, 60 * 1_000))
      ]) as Awaited<ReturnType<typeof Game.useOTP>>
      const msg = `${character.name} > ${outcome.message}`
      console.log(msg)
      ok.push(msg)
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (err : any) {
      console.log(err)
      errors.push(err.message)
    }
  }

  return {ok, errors}
}