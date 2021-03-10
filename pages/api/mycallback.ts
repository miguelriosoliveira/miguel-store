import type { NextApiRequest, NextApiResponse } from "next";

export default async function (req: NextApiRequest, res: NextApiResponse) {
  console.log("---", req.method, "---");
  res.status(200).json({ name: "John Not Post" });
}
