import auth0 from "auth0-js";
import jwtDecode from "jwt-decode";
import axios from "axios";
import { VARS_CONFIG } from "../react-variables";

/* eslint no-restricted-globals:0*/
const LOGIN_SUCCESS_PAGE = "/dashboard";
const LOGIN_FAILURE_PAGE = "/";

class Auth {
  accessToken;
  idToken;
  expiresAt;
  userProfile;
  myId;

  auth0 = new auth0.WebAuth({
    domain: "princess-minina.auth0.com",
    clientID: "D7qof03S1ZPHBdDrX00CHROyOdQlKqM2",
    redirectURI: `${VARS_CONFIG.localhost}/callback`,
    audience: "https://icrosslandAPI",
    responseType: "token id_token",
    scope: "openid profile email read:messages"
  });

  constructor() {
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.handleAuthentication = this.handleAuthentication.bind(this);
    this.isAuthenticated = this.isAuthenticated.bind(this);
    this.getAccessToken = this.getAccessToken.bind(this);
    this.getIdToken = this.getIdToken.bind(this);
    // this.renewSession = this.renewSession.bind(this);
    this.getProfile = this.getProfile.bind(this);
    this.checkForProfile = this.checkForProfile.bind(this);
  }

  login() {
    this.auth0.authorize();
  }

  handleAuthentication() {
    // TODO: CHECK FOR PROFILE FUNCTION NOT FINISHING CORRECTLY,
    // CONSIDER A BETTER PLACE INSIDE SETSESSION BEFORE IT'S REDIRECTED TO DIFFERENT PAGE
    this.auth0.parseHash((err, authResults) => {
      if (authResults && authResults.accessToken && authResults.idToken) {
        this.setSession(authResults);
        this.checkForProfile();
      } else if (err) {
        location.pathname = LOGIN_FAILURE_PAGE;
        alert(`Error: ${err.error}. Check the console for further details.`);
        console.log(err);
      }
    });
  }

  checkForProfile() {
    /**********************************************************************
      get profile into database!
    **********************************************************************/
    let profile = this.getProfile();
    console.log(`access token from Auth.js:  ${this.getAccessToken()}`);

    const headers = {
      Authorization: `Bearer ${this.getAccessToken()}`
    };

    axios({
      method: "post",
      url: `${VARS_CONFIG.localhost}/api/users`,
      headers,
      data: profile
    })
      .then(res => {
        console.log(`the response is: ${res}`);
      })
      .catch(err => {
        console.log("post axios failure", err);
      });
    // this.setLocalStorageID();
  }

  setSession(authResults) {
    let expireAt = JSON.stringify(
      authResults.expiresIn * 1000 + new Date().getTime()
    );

    this.expiresAt = expireAt;
    this.accessToken = authResults.accessToken;
    this.idToken = authResults.idToken;
    localStorage.setItem("isLoggedIn", "true");

    localStorage.setItem("access_token", this.accessToken);
    localStorage.setItem("id_token", this.idToken);
    localStorage.setItem("expires_at", this.expiresAt);
    location.hash = "";
    location.pathname = LOGIN_SUCCESS_PAGE;
  }

  getAccessToken() {
    if (localStorage.getItem("id_token")) {
      return localStorage.getItem("access_token");
    } else return "no access token";
  }

  getIdToken() {
    return this.idToken;
  }

  isAuthenticated() {
    let expireAt = JSON.parse(localStorage.getItem("expires_at"));
    return new Date().getTime() < expireAt;
  }

  logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("id_token");
    localStorage.removeItem("expires_at");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("myId");

    // Remove tokens, expiry time and userProfile info
    this.accessToken = null;
    this.idToken = null;
    this.expiresAt = 0;
    this.userProfile = null;
    this.myId = null;

    location.pathname = LOGIN_FAILURE_PAGE;
  }

  getProfile() {
    if (localStorage.getItem("id_token")) {
      this.userProfile = jwtDecode(localStorage.getItem("id_token"));
      return this.userProfile;
    } else {
      return {};
    }
  }
}

export default Auth;
