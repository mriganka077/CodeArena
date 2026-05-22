import express from "express";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

export const initGoogleStrategy = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails[0].value;
          const photo = profile.photos?.[0]?.value || "";

          let user = await User.findOne({ email });
          let isNewUser = false; // ← track if newly created

          if (user) {
            user.googleId = profile.id;
            user.isVerified = true;
            if (photo) user.picture = photo;
            await user.save();
          } else {
            user = await User.create({
              firstName: profile.name.givenName,
              lastName: profile.name.familyName || ".",
              email,
              googleId: profile.id,
              picture: photo,
              isVerified: true,
            });
            isNewUser = true; // ← newly created
          }

          // Pass isNewUser flag through to the callback route via user object
          user._isNewUser = isNewUser;
          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
};

// GET /api/auth/google
router.get(
  "/",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// GET /api/auth/google/callback
router.get(
  "/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.CLIENT_URL}/login?error=google_failed`,
    session: false,
  }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    const isNew = req.user._isNewUser ? "&new=true" : "";
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}${isNew}`);
  }
);

export default router;