import type { Request, Response, NextFunction } from "express";
import { prisma } from "@repo/database";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { username, email, password } = req.body;
    if (!(username && email && password)) {
      return res.status(401).json({ message: "All fields are required" });
    }

    //checking if the user already exist
    const exstUser = await prisma.user.findUnique({ where: { email } });
    if (exstUser) {
      return res.status(401).json({ message: "User already exist" });
    }

    //hash password
    const encryptedpassword = await bcrypt.hash(password, 10);

    //Create new entry
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: encryptedpassword,
      },
    });

    //generate a token and send it to user
    const token = jwt.sign(
      {
        id: user.id,
        email,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" },
    );

    //dont want to send this to the user
    user.password = "";
    res.status(201).json({ user, token });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error });
    console.log(error);
  }
};

export const signin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;
    // complete signin logic
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    //generate a token and send it to user
    const token = jwt.sign(
      {
        id: user.id,
        email,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" },
    );

    //dont want to send this to the user
    user.password = "";
    res.status(200).json({ user, token });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error });
  }
};
