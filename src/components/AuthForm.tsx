'use client'
import * as React from "react";
import { Button, Checkbox, Form } from "@nextui-org/react";
import InputField from "./InputField";

interface AuthFormProps {
    isLogin: boolean;
    onSubmit: (data: Record<string, string>) => Promise<void>;
}

export default function AuthForm({ isLogin, onSubmit }: AuthFormProps) {
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [username, setUsername] = React.useState("");
    const [firstName, setFirstName] = React.useState("");
    const [lastName, setLastName] = React.useState("");
    const [rememberMe, setRememberMe] = React.useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data: Record<string, string> = Object.fromEntries(
            formData.entries()
        ) as Record<string, string>;
        if (Object.keys(data).length === 0) {
            console.error("No data found");
            return;
        } else {
            try {
                const payload = JSON.stringify(data, null, 2)
                await onSubmit(payload);
                console.log(`${isLogin ? "Login" : "Registration"} successful`);
                console.log(JSON.stringify(data, null, 2));
            } catch (error) {
                console.error("Error:", error);
            }
        }
    };
    
    return (
        <Form className="flex flex-col gap-3 w-full max-w-full" onSubmit={handleSubmit}>
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
            <InputField
                label="Password"
                placeholder="Enter your password"
                type="password"
                value={password}
                name="password"
                onValueChange={setPassword}
                validate={(value) =>
                    value.length < 4
                    ? "Password must be at least 4 characters long"
                    : null
                }
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
            <Button type="submit" className="w-full" color="primary">
                {isLogin ? "Sign in" : "Register"}
            </Button>
        </Form>
    );
}
