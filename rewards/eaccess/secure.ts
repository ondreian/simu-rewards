import * as tls from "tls"
const host = "eaccess.play.net"
const port = 7910

const options = {host, port, rejectUnauthorized: false}
type CharacterInfo = {
  name: string;
  slot: string;
}

export type OTP = {
  key: string;
  host: string;
  port: number;
}

enum State {
  Starting,
  Handshaking,
  Authenticated,
  Finished,
}

export enum Mode {
  Characters,
  Login,
}

export enum GameCode {
  GS4 = "GS3",
  GST = "GST",
  GSF = "GSF",
  GSX = "GSX",
  DR  = "DR",
  DRT = "DRT",
  DRF = "DRF",
  DRX = "DRX",
}

function hashChar(pwChar : string, hashNum : number) {
  return (hashNum ^ (pwChar.charCodeAt(0) - 32)) + 32;
}

export async function sendAccountDetails (sge :tls.TLSSocket, account : string, password: string, mask: string) {
  const maskedPassword = password.split("").map((char, i) => hashChar(char, mask[i].charCodeAt(0)))

  const auth = Buffer.concat([
    Buffer.from(`A\t${account}\t`),
    Buffer.from(maskedPassword),
  ])
  sge.write(auth, "binary")
}

export function tsv (s : string) {
  return s.trim().split("\t")
}

export function tsvToRecord (list : string[]) : Record<string, string> {
  return Object.fromEntries(list.reduce((acc, v, idx)=>{
    if (idx % 2 == 1) {
      acc[acc.length-1].push(v)
    } else {
      acc.push([v] as any)
    }

    return acc
  }, [] as Array<[string, string]>))
}

export function parseGameList (incoming : string) : Record<string, string> {
  const list = tsv(incoming).slice(1)
  return tsvToRecord(list)
}

interface AfterAuth {
  (sge : tls.TLSSocket, incoming : string): void
}

// I hate this, but because of the statement nature of the underlying socket
// and the pure nature of a Promise, we have to find a way to ensure underlying
// socket errors propogate to the Promise wrapping them
type Todo = 
 | any

export function auth (account : string, password : string, reject : Todo, callback : AfterAuth) : void {
  let state = State.Starting
  const sge = tls.connect({...options}, () => {
    //console.log(`connected to %s:%s`, options.host, options.port)
    
    sge.write('K')

    // Handle incoming data
    sge.on('data', (data : Buffer) => {
      if (state == State.Starting) {
        state = State.Handshaking
        return sendAccountDetails(sge, account, password, data.toString())
      }

      if (state == State.Handshaking) {
        const incoming = data.toString()
        if (incoming.includes("PASSWORD")) {
          reject(new Error(`account:${account} | invalid password`))
        }
        if (incoming.endsWith("PROBLEM")) {
          reject(new Error(incoming))
        }
        if (incoming.startsWith("?")) {
          reject(new Error("invalid protocol implementation"))
        }
        if (incoming.startsWith("A") && incoming.includes("KEY")) {
          state = State.Authenticated
          return sge.write("M")
        }
      }

      if (state == State.Authenticated) {
        callback(sge, data.toString())
      }
    })
  })
}

function handleCommon (sge : tls.TLSSocket, incoming : string, gameCode : GameCode) {
  if (incoming.startsWith("M")) {
    return {ok: sge.write(`N\t${gameCode}\n`)}
  }
  if (incoming.startsWith("N")) {
    return {ok: sge.write(`G\t${gameCode}\n`)}
  }
  if (incoming.startsWith("G")) {
    return {ok: sge.write("C\n")}
  }
  return {noop: true}
}

function handleCharacters (incoming : string) {
  if (incoming.startsWith("C")) {
    const records = tsvToRecord(tsv(incoming).slice(5))
    return {ok: Object.entries(records).map(([slot, name])=> ({slot, name}))}
  }

  return {noop: true}
}

export async function listCharacters (account : string, password : string, gameCode : GameCode) : Promise<CharacterInfo[]> {
  return new Promise((resolve, reject)=> {
    try {
      auth(account, password, reject, (sge, incoming)=> {
        const common = handleCommon(sge, incoming, gameCode)
        if (common.ok) return
        const characters = handleCharacters(incoming)
        if (characters.ok) {
          sge.destroy()
          resolve(characters.ok)
        }
      })
    } catch (err) {
      reject(err)
    }
  })
}

export async function getOTP (account : string, password : string, gameCode : GameCode, requestedCharacter : string) : Promise<OTP> {
  return new Promise((resolve, reject)=> {
    try {
      auth(account, password, reject, (sge, incoming)=> {
        const common = handleCommon(sge, incoming, gameCode)
        if (common.ok) return
        const characters = handleCharacters(incoming)
        if (characters.ok) {
          const character = characters.ok.find(({name: availableCharacter})=> availableCharacter.toLowerCase() == requestedCharacter.toLowerCase())
          if (!character) {
            sge.destroy()
            return reject(new Error(`account ${account} does not have requested character ${requestedCharacter}`))
          }
          return sge.write(`L\t${character.slot}\tSTORM\n`)
        }
        
        if (incoming.startsWith("L")) {
          const key = incoming.match(/KEY=(\S+)/)![1]
          const host = incoming.match(/GAMEHOST=(\S+)/)![1]
          const port = parseInt(incoming.match(/GAMEPORT=(\d+)/)![1], 10)
          sge.destroy()
          return resolve({key, host, port})
        }

        return reject(new Error(`Error - unknown text received:\n${incoming}`))
      })
    } catch (err) {
      reject(err)
    }
  })
}
