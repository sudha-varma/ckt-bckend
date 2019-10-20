import randomstring from "randomstring";
import jwt from "jsonwebtoken";
import sha1 from "sha1";
import Hashids from "hashids";
import config from "../../config";
import logger from "../../utils/logger";

const hashids = new Hashids(config.hashKey);
const { privateKey, tokenExpiry, tokenIssuer } = config.jwt;
const verifyAccessToken = token => {
  let err;
  let decodedData;
  if (token) {
    jwt.verify(token, privateKey, (error, decodedInfo) => {
      if (error) {
        err = error;
      } else {
        decodedData = {
          id: decodedInfo.id,
          email: decodedInfo.email,
        };
      }
    });
  } else {
    err = true;
  }
  return {
    err,
    decodedData,
  };
};

export default {
  generateSalt() {
    return randomstring.generate(7);
  },
  hashPassword(password, salt) {
    return sha1(password + salt);
  },
  generateAccessToken(obj) {
    try {
      const jwtOptions = {
        issuer: tokenIssuer,
        audience: String(obj.id),
      };
      jwtOptions.expiresIn = tokenExpiry;
      const userObj = {
        id: obj.id,
        email: obj.email,
      };
      return jwt.sign(userObj, privateKey, jwtOptions);
    } catch (err) {
      logger.error(err.message);
    }
  },
  verifyAccessToken,
  generateRefreshToken(user) {
    try {
      return jwt.sign(
        {
          type: "refresh",
          hashedId: hashids.encode(user.id),
          userType: user.userType,
        },
        privateKey,
        {
          expiresIn: "20 days",
          issuer: tokenIssuer,
          audience: "rt",
        },
      );
    } catch (err) {
      logger.error(err.message);
    }
  },
  generateNewOTP() {
    // TODO: Setup otp expiry,
    // TODO: if current otp is not expired send the same
    // return randomstring.generate({
    //   length: 6,
    //   charset: "numeric"
    // });
    return "123456";
  },
  generateNewPWD() {
    const specials = "!@#$%^&*()_+{}:\"<>?|[];',./`~";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";

    const all = specials + lowercase + uppercase + numbers;

    let password = "";
    password += specials.pick(1);
    password += lowercase.pick(1);
    password += uppercase.pick(1);
    password += all.pick(3, 10);
    password = password.shuffle();
    return password;
  },
};
/* eslint-disable-next-line  */
String.prototype.pick = function(min, max) {
  let n;
  let chars = "";

  if (typeof max === "undefined") {
    n = min;
  } else {
    n = min + Math.floor(Math.random() * (max - min + 1));
  }

  for (let i = 0; i < n; i += 1) {
    chars += this.charAt(Math.floor(Math.random() * this.length));
  }

  return chars;
};

// Credit to @Christoph: http://stackoverflow.com/a/962890/464744
/* eslint-disable-next-line  */
String.prototype.shuffle = function() {
  const array = this.split("");
  let tmp;
  let current;
  let top = array.length;

  if (top) {
    top -= 1;
    while (top) {
      current = Math.floor(Math.random() * (top + 1));
      tmp = array[current];
      array[current] = array[top];
      array[top] = tmp;
      top -= 1;
    }
  }

  return array.join("");
};
