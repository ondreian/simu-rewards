import * as Rewards from "./rewards"
import type { GameCode } from "./rewards/eaccess/secure"

const account = process.env.ACCOUNT
const password = process.env.PASSWORD
const gameCode = process.env.GAME_CODE || "GS3"

if (!account) {
  throw new Error("account was missing")
}

if (!password) {
  throw new Error(`password was missing for ${account}`)
}

if (!gameCode) {
  throw new Error("game was missing")
}

const errors = []

try {
  const res = await Rewards.Account.claimAccountRewards(account, password)
  console.log("%s | balance %s > %s", res.account, res.message, res.balance)
} catch (err : any) {
  console.log(err)
  errors.push(err.message)
}
const characters = await Rewards.SGE.Secure.listCharacters(account, password, gameCode as GameCode)
for (const character of characters) {
  try {
    //console.log("logging in %s", character.name)
    const otp = await Rewards.SGE.Secure.getOTP(account, password, gameCode as GameCode, character.name)
    //console.log("received for %s at %s:%s", character.name, otp.host, otp.port)
    const outcome = await Rewards.Game.useOTP(otp)
    console.log("%s > %s", character.name, outcome.message)
    await new Promise(resolve => setTimeout(resolve, 500))
  } catch (err : any) {
    console.log(err)
    errors.push(err.message)
  }
}
if (errors.length > 0) {
  process.exit(1)
}
process.exit(0)
