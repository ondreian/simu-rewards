import * as net from "net"
import type { OTP } from "./eaccess/secure";

export async function useOTP (otp : OTP) : Promise<{message: string}> {
  return new Promise((ok, err)=> {
    const game = new net.Socket()
    game.setDefaultEncoding("ascii")

    game.connect({host: otp.host, port: otp.port}, ()=> {  
      //console.log("connected to %s:%s", otp.host, otp.port)
      game.write(otp.key + "\n")
      game.write("/FE:STORMFRONT /VERSION:1.0.1.22 /XML\n")
    })

    game.on("data", (data : Buffer) => {
      const incoming = data.toString()
      //console.log(incoming)
      if (incoming.startsWith("<settingsInfo ")) {
        game.write("<c>\r\n")
        game.write("<c>\r\n")
      }

      if (incoming.includes("You have earned the following reward:")) {
        const m = incoming.match(/You have earned the following reward: (.*)!/)
        const message = m ? m[1] : "claimed login reward"
        game.destroy()
        ok({message: message})
      }

      if (incoming.includes(`<prompt time=`)) {
        game.destroy()
        ok({message: "already claimed"})
      }
    })

    game.on("error", err)
  })
}