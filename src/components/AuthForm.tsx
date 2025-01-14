'use client'
import * as React from "react";
import { useState, useEffect } from "react";
import { Button, Checkbox, Form } from "@nextui-org/react";
import InputField from "./InputField";
import toast from "react-hot-toast";
import { Input } from "@nextui-org/react";
import { EyeFilledIcon, EyeSlashFilledIcon } from "./icons/eyes";

interface AuthFormProps {
    isLogin: boolean;
    onSubmit: (data: Record<string, string>) => Promise<void>;
}

export default function AuthForm({ isLogin, onSubmit }: AuthFormProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [Loading, setLoading] = useState(false);
    const [isVisible, setIsVisible] = React.useState(false);



    const toggleVisibility = () => setIsVisible(!isVisible);



    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        const data: Record<string, string> = Object.fromEntries(
            formData.entries()
        ) as Record<string, string>;
        if (Object.keys(data.userName).length === 0 || Object.keys(data.password).length === 0) {
            toast.error("Please fill in all fields");
            setLoading(false);
            return;
        } else {
            try {
                const payload = JSON.stringify(data, null, 2)
                await onSubmit(payload);

                console.log(`${isLogin ? "Login" : "Registration"} successful`);
                console.log(JSON.stringify(data, null, 2));
            } catch (error) {
                console.error("Error:", error);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <Form className="flex flex-col gap-3 w-full max-w-full " onSubmit={handleSubmit}>
            {!isLogin && (
                <>
                    <InputField
                        label="Email"
                        placeholder="Enter your email"
                        type="email"
                        value={email}
                        name="email"
                        onValueChange={setEmail}
                        validate={(value) =>
                            !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value)
                                ? "Invalid email address"
                                : null
                        }
                    />
                    <InputField

                        label="First Name"
                        placeholder="Enter your First Name"
                        type="text"
                        value={firstName}
                        onValueChange={setFirstName}
                        name="FirstName"
                        validate={(value) =>
                            value.length < 3
                                ? "First Name must be at least 3 characters long"
                                : null
                        }
                    />
                    <InputField
                        label="Last Name"
                        placeholder="Enter your Last Name"
                        type="text"
                        value={lastName}
                        name="LastName"
                        onValueChange={setLastName}
                        validate={(value) =>
                            value.length < 3
                                ? "Last Name must be at least 3 characters long"
                                : null
                        }
                    />
                </>
            )}
            <InputField
                label="Username"
                placeholder="Enter your username"
                type="text"
                value={username}
                name="userName"
                onValueChange={setUsername}
                validate={(value) =>
                    value.length < 3
                        ? "Username must be at least 3 characters long"
                        : null
                }
            />
            <Input
                isRequired
                endContent={
                  <button
                    aria-label="toggle password visibility"
                    className="focus:outline-none"
                    type="button"
                    onClick={toggleVisibility}
                  >
                    {isVisible ? (
                      <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                    ) : (
                      <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                    )}
                  </button>
                }
                type={isVisible ? "text" : "password"}
                variant="bordered"
                label="Password"
                placeholder="Enter your password"
                value={password}
                name="password"
                onValueChange={setPassword}
                // validate={(value) =>
                //     value.length < 4
                //         ? "Password must be at least 4 characters long"
                //         : null
                // }
            />
            {isLogin && (
                <div className="flex items-center justify-between">
                    <Checkbox
                        classNames={{ label: "text-small" }}
                        name="remember"
                        value="true"
                        onValueChange={() => setRememberMe((prev) => !prev)}
                    >
                        Remember me
                    </Checkbox>
                </div>
            )}
            <Button type="submit" className="w-full" color="primary" isLoading={Loading}>
                {isLogin ? "Sign in" : "Register"}
            </Button>
        </Form>
    );
}
