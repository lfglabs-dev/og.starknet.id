// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import whitelistsData from "./whitelistsData.json";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const {
    query: { address },
  } = req;
  res.status(200).json(
    whitelistsData[address as keyof typeof whitelistsData] ?? {
      error: "Not whitelisted",
    }
  );
}
