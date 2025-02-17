"use client";

import Button from "@/src/components/common/button/Button";
import Input from "@/src/components/common/input/Input";
import Notification from "@/src/components/common/notification/Notification";
import { Database } from "@/supabase/database";
import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { FormEvent, Fragment, useState } from "react";

export default function Login() {
  const supabase = useSupabaseClient<Database>();
  const [email, setEmail] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [show, setShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [errorMessage, setErrorMessage] = useState<undefined | string>(
    undefined
  );

  const usernameLentgh = 15;

  function setUsernameVal(username: string) {
    setUsername(username.replace(/[^a-zA-Z0-9 ]/, "").trim());
  }

  async function login(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    if (email === "" || (!isLogin && username === "")) {
      setIsLoading(false);
      return;
    }

    if (!isLogin && username !== "") {
      // Username validation
      const { data: userData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .maybeSingle();

      if (error || userData) {
        setErrorMessage("Username is already in use.");
        setIsLoading(false);
        return;
      }
    }

    var randomColor = Math.floor(Math.random() * 16777215).toString(16);

    const { data } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        emailRedirectTo: process.env.NEXT_PUBLIC_REDIRECT_URL,
        data: {
          username: username,
          avatar_url: `https://ui-avatars.com/api/?color=ffffff&background=${randomColor}&bold=true&size=128&name=${username}`,
        },
      },
    });

    if (data) {
      setShow(true);
      setErrorMessage(undefined);
    }
    setIsLoading(false);
  }

  return (
    <>
      <div className="flex min-h-lg flex-col justify-center pt-24 pb-72 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Login to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            You can filter your incoming questions with creating a profile
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form
              className="space-y-6"
              action="#"
              method="POST"
              onSubmit={(e) => login(e)}
            >
              {!isLogin && (
                <Input
                  label="Username"
                  name="username"
                  required
                  maxLength={usernameLentgh}
                  type={"text"}
                  placeholder="cool.monkey"
                  value={username}
                  onChange={(e) => setUsernameVal(e.target.value)}
                />
              )}

              <Input
                label="Email"
                name="email"
                required
                type={"email"}
                placeholder="john.doe@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              {errorMessage && (
                <div className="text-sm text-red-500">{errorMessage}</div>
              )}

              <div>
                <Button
                  variant="contained"
                  className="w-full"
                  startIcon={<ArrowRightOnRectangleIcon className="w-5 h-5" />}
                  type="submit"
                  isLoading={isLoading}
                >
                  {!isLogin ? "Register" : "Login"}
                </Button>

                <div className="flex justify-center text-sm pt-3 space-x-2">
                  <div className="text-sm text-gray-500">
                    {isLogin ? "Get questions from anoynmous users" : "or"}
                  </div>

                  <button
                    type="button"
                    className="font-bold text-purple-700"
                    onClick={() => setIsLogin(!isLogin)}
                  >
                    {isLogin ? "Register" : "Login"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Notification show={show} setShow={setShow} />
    </>
  );
}
