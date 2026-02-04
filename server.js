require("dotenv").config()
const express=require("express")
const fetch=require("node-fetch")
const {Base64}=require("js-base64")

const app=express()
app.use(express.json())

const GITHUB_TOKEN=process.env.GITHUB_TOKEN
const REPO="TU_USUARIO/roblox-scripts"
const FILE_PATH="scripts.lua"

app.post("/publicar",async(req,res)=>{
  const{name,code,author}=req.body
  if(!name||!code||!author)return res.status(400).send("Faltan datos")
  try{
    const fileRes=await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`,{
      headers:{Authorization:`token ${GITHUB_TOKEN}`}
    })
    const fileData=await fileRes.json()
    const currentContent=Base64.decode(fileData.content)
    let table=eval(currentContent)
    table[name]={code:code,author:author}
    const newContent="return "+JSON.stringify(table,null,2)
    const encodedContent=Base64.encode(newContent)
    await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`,{
      method:"PUT",
      headers:{Authorization:`token ${GITHUB_TOKEN}`,"Content-Type":"application/json"},
      body:JSON.stringify({message:`Añadir script: ${name} por ${author}`,content:encodedContent,sha:fileData.sha})
    })
    res.send(`✅ Script "${name}" publicado en GitHub por ${author}`)
  }catch(err){
    console.error(err)
    res.status(500).send("Error al publicar script")
  }
})

app.listen(3000,()=>console.log("Servidor escuchando en puerto 3000"))
