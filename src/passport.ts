import {Application, NextFunction, Request, Response} from "express";
import {authenticate, initialize, use} from "passport";
import {BasicStrategy} from "passport-http";
import {Strategy as BearerStrategy} from "passport-http-bearer";
import {OAuth2Strategy as GoogleStrategy} from "passport-google-oauth";
import {Strategy as FacebookStrategy} from "passport-facebook";
import * as createHttpError from "http-errors";
import {userService} from "./service/userService";

const KakaoStrategy = require("passport-kakao").Strategy;
const NaverStrategy = require("passport-naver").Strategy;

export const basicAuthorize = (req: Request, res: Response, next: NextFunction) => {
    return authenticate("basic", (err: any, user: any, authInfo: any) => {
        if (err || user === false) {
            next(createHttpError(401));
        } else {
            req.authInfo = authInfo;
            req.user = user;
            next();
        }
    })(req, res, next);
};

export const bearAuthorize = (req: Request, res: Response, next: NextFunction) => {
    return authenticate("bearer", (err: any, user: any, authInfo: any) => {
        if (err || user === false) {
            next(createHttpError(401));
        } else {
            req.authInfo = authInfo;
            req.user = user;
            next();
        }
    })(req, res, next);
};

export const googleBasicAuthorize = authenticate("google", {scope: ["profile", "email"]});

export const googleBearerAuthorize = (req: Request, res: Response, next: NextFunction) => {
    return authenticate("google", (err: any, user: any, authInfo: any) => {
        if (err || user === false) {
            next(createHttpError(401));
        } else {
            req.authInfo = authInfo;
            req.user = user;
            next();
        }
    })(req, res, next);
};

export const facebookBasicAuthorize = authenticate("facebook", {scope: ["email"]});

export const facebookBearerAuthorize = (req: Request, res: Response, next: NextFunction) => {
    return authenticate("facebook", (err: any, user: any, authInfo: any) => {
        if (err || user === false) {
            next(createHttpError(401));
        } else {
            req.authInfo = authInfo;
            req.user = user;
            next();
        }
    })(req, res, next);
};

export const kakaoBasicAuthorize = authenticate("kakao", {scope: [""]});

export const kakaoBearerAuthorize = (req: Request, res: Response, next: NextFunction) => {
    return authenticate("kakao", (err: any, user: any, authInfo: any) => {
        if (err || user === false) {
            next(createHttpError(401));
        } else {
            req.authInfo = authInfo;
            req.user = user;
            next();
        }
    })(req, res, next);
};

export const naverBasicAuthorize = authenticate("naver");

export const naverBearerAuthorize = (req: Request, res: Response, next: NextFunction) => {
    return authenticate("naver", (err: any, user: any, authInfo: any) => {
        if (err || user === false) {
            next(createHttpError(401));
        } else {
            req.authInfo = authInfo;
            req.user = user;
            next();
        }
    })(req, res, next);
};

export function configPassport(app: Application) {
    app.use(initialize());
    use(new BasicStrategy((username, password, done: (err?: any, profile?: any) => void) => {
        userService.certification({
            username: username,
            credentials: password
        }, "password")
            .subscribe((user: any) => {
                done(null, user);
            }, err => {
                done(err);
            });
    }));
    // use(new BearerStrategy(process.env.SECRET, (token: any, done: (err?: any, result?: any) => void) => {
    //     userService.getByToken(token)
    //         .subscribe((user) => {
    //             done(null, user);
    //         }, err => {
    //             done(err);
    //         });
    // }));
    use(new GoogleStrategy({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "http://localhost:3000/auth/google/callback",
        },
        (accessToken, refreshToken, profile, done) => {
            userService.certification(profile, "google")
                .subscribe((user: any) => {
                    done(null, user);
                }, err => {
                    done(err);
                });
        }
    ));
    use(new FacebookStrategy({
            clientID: process.env.FACEBOOK_CLIENT_ID,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
            callbackURL: "http://localhost:3000/auth/facebook/callback",
            profileFields: ["id", "displayName", "photos", "email"]
        },
        (accessToken, refreshToken, profile, done) => {
            userService.certification(profile, "facebook")
                .subscribe((user: any) => {
                    done(null, user);
                }, err => {
                    done(err);
                });
        }
    ));
    use(new KakaoStrategy({
            clientID: process.env.KAKAO_CLIENT_ID,
            clientSecret: process.env.KAKAO_CLIENT_SECRET,
            callbackURL: "http://localhost:3000/auth/kakao/callback"
        },
        (accessToken: any, refreshToken: any, profile: any, done: any) => {
            userService.certification(profile, "kakao")
                .subscribe((user: any) => {
                    done(null, user);
                }, err => {
                    done(err);
                });
        }
    ));
    use(new NaverStrategy({
            clientID: process.env.NAVER_CLIENT_ID,
            clientSecret: process.env.NAVER_CLIENT_SECRET,
            callbackURL: "http://localhost:3000/auth/naver/callback"
        },
        (accessToken: string, refreshToken: string, profile: any, done: (err: any, user?: any) => void) => {
            userService.certification(profile, "naver")
                .subscribe((user: any) => {
                    done(null, user);
                }, err => {
                    done(err);
                });
        }
    ));
}