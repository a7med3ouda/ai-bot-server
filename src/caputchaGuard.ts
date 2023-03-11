import { verify } from "hcaptcha";
import { Request, Response, NextFunction } from "express";

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers["X-CAPUTCHA-TOKEN"] as string;
    console.log(token);

    if (!token)
      return res
        .status(400)
        .json({ subject: "caputcha", message: "Invalid captcha" });

    const data = await verify(process.env.CAPUTCHA_SECRET, token);
    if (data.success === true) {
      next();
    } else {
      return res
        .status(400)
        .json({ subject: "caputcha", message: "Invalid captcha" });
    }
  } catch (error: any) {
    return res
      .status(400)
      .json({ subject: "caputcha", message: error.message });
  }
};
