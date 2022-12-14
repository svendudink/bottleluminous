import { createContext, useEffect, useState, useRef, useContext } from "react";
import { GlobalContext } from "./GlobalContext";

export const UserContext = createContext();

export const UserContextProvider = (props) => {
  const { activePage, setActivePage } = useContext(GlobalContext);

  const [messages, setMessages] = useState("");
  const [errorMessages, setErrorMessages] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [personalInfo, setPersonalInfo] = useState({
    emailAdress: "",
    password: "",
    aboutCompany: "",
    companyName: "",
    phoneNumber: "",
    yourName: "",
    loginEmailAdress: "",
    loginPassword: "",
    id: "",
    token: "",
  });
  const [text, setText] = useState({
    emailAdress: "",
    password: "",
    aboutCompany: "",
    companyName: "",
    phoneNumber: "",
    yourName: "",
    loginEmailAdress: "",
    loginPassword: "",
    id: "",
    token: "",
  });

  const userData = useRef({});
  /////////////////////////////////////Sven's//Coding/ Date: 22-11-2022 15:20 ////////////
  // personalData is grouped as:
  // 0. firstname
  // 1. country
  //
  //
  //
  //
  /////////////////////////////////////////gnidoC//s'nevS////////////////////////////////
  console.log(activePage);

  useEffect(() => {
    setErrorMessages("");
  }, [activePage]);

  const UserGraphQLHandler = async (request, personalData) => {
    console.log(personalData);
    const requestList = [
      `mutation {
  createUser(userInput: {emailAdress:"${personalData.emailAdress}", password:"${personalData.password}", aboutCompany: "${personalData.aboutCompany}", companyName: "${personalData.companyName}", phoneNumber: "${personalData.phoneNumber}", yourName: "${personalData.yourName}" })
  
  {
    _id
    emailAdress
    password
    token
  }}
`,
      `{
        login(emailAdress: "${personalData.loginEmailAdress}", password: "${personalData.loginPassword}"){
          token
          userId
        }
      }
`,
      `{
        idLogin(id: "${personalData.id}", token: "${personalData.token}"){
          yourName
          companyName
        }
      }
`,
    ];
    console.log("view", requestList[request]);
    const graphglQuery = {
      query: requestList[request],
    };
    await fetch("https://bottle.hopto.org:8080/graphql", {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify(graphglQuery),
    })
      .then((res) => res.json())
      .then((resData) => (userData.current = resData));

    console.log("second");
    console.log(userData.current);
    if (userData.current.data) {
      setErrorMessages("");
      setMessages(userData.current.data);
    }

    if (userData.current.errors) {
      console.log("check", userData.current.errors[0].message);
      setMessages("");
      setErrorMessages(userData.current.errors[0].message);
      setText({
        emailAdress: "",
        password: "",
        aboutCompany: "",
        companyName: "",
        phoneNumber: "",
        yourName: "",
        loginEmailAdress: "",
        loginPassword: "",
      });

      console.log(errorMessages);
    }

    if (request === 1 && userData.current.data.login.token) {
      localStorage.setItem("token", userData.current.data.login.token);
      console.log("token");
      setLoggedIn(true);
      setErrorMessages("");
      setText({
        emailAdress: "",
        password: "",
        aboutCompany: "",
        companyName: "",
        phoneNumber: "",
        yourName: "",
        loginEmailAdress: "",
        loginPassword: "",
      });
    }
    if (request === 2 && userData.current.data.idLogin.yourName) {
      setPersonalInfo({
        yourName: userData.current.data.idLogin.yourName,
        companyName: userData.current.data.idLogin.companyName,
      });
    }
  };

  return (
    <UserContext.Provider
      value={{
        UserGraphQLHandler,
        userData,
        loggedIn,
        setLoggedIn,
        errorMessages,
        setErrorMessages,
        text,
        setText,
        messages,
        setMessages,
        setPersonalInfo,
        personalInfo,
      }}
    >
      {props.children}
    </UserContext.Provider>
  );
};
