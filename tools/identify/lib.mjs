// Shared BioCLIP helpers (Node): tokenizer, text encoder, image encoder.
import ort from "onnxruntime-node";
import * as ortWeb from "onnxruntime-web";
import fs from "node:fs";
import sharp from "sharp";
import { AutoTokenizer, env } from "@huggingface/transformers";
env.localModelPath = new URL("./", import.meta.url).pathname;
env.allowRemoteModels = false;

const MEAN = [0.48145466, 0.4578275, 0.40821073];
const STD = [0.26862954, 0.26130258, 0.27577711];
let tok, textSess, imgSess;

export async function tokenize(texts) {
  tok ??= await AutoTokenizer.from_pretrained("models");
  const out = new BigInt64Array(texts.length * 77);
  texts.forEach((t, i) => {
    let ids = tok.encode(t); // includes <|startoftext|> … <|endoftext|>
    if (ids.length > 77) ids = [...ids.slice(0, 76), 49407];
    ids.forEach((id, k) => (out[i * 77 + k] = BigInt(id)));
  });
  return out;
}

export async function embedTexts(texts) {
  textSess ??= await ort.InferenceSession.create(new URL("./models/text_encoder_fp16.onnx", import.meta.url).pathname);
  const ids = await tokenize(texts);
  const feeds = { [textSess.inputNames[0]]: new ort.Tensor("int64", ids, [texts.length, 77]) };
  const r = await textSess.run(feeds);
  return r[textSess.outputNames[0]].data; // Float32Array n×512, L2-normalised
}

export async function pixels(input) {
  // shortest side → 224 (bicubic), centre crop, CLIP normalisation, CHW
  const { data } = await sharp(input).rotate().resize(224, 224, { fit: "cover", position: "centre", kernel: "cubic" }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const f = new Float32Array(3 * 224 * 224);
  for (let i = 0; i < 224 * 224; i++) for (let c = 0; c < 3; c++) f[c * 224 * 224 + i] = (data[i * 3 + c] / 255 - MEAN[c]) / STD[c];
  return f;
}

export async function embedImage(input) {
  // same runtime the browser uses (WebAssembly): the native CPU build lacks ConvInteger
  imgSess ??= await ortWeb.InferenceSession.create(fs.readFileSync(new URL("./models/bioclip-image-int8.onnx", import.meta.url).pathname));
  const r = await imgSess.run({ [imgSess.inputNames[0]]: new ortWeb.Tensor("float32", await pixels(input), [1, 3, 224, 224]) });
  return r[imgSess.outputNames[0]].data;
}
