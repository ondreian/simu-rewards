import * as Rewards from "./rewards"
import { GameCode } from "./rewards/eaccess/secure"

const account = process.env.ACCOUNT
const password = process.env.PASSWORD
const gameCode = (process.env.GAME_CODE || GameCode.GS4) as GameCode

const {errors} = await Rewards.claim(account, password, gameCode)

if (errors.length > 0) process.exit(1)
process.exit(0)