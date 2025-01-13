// // 'use client'
// // import * as React from "react";
// // import { Button, Checkbox, Form, Input } from "@nextui-org/react";
// // import { LoginRequest, postLogin } from "@/app/services/auth";

// // export default function LoginForm() {
// //     const [email, setEmail] = React.useState("");
// //     const [submitted, setSubmitted] = React.useState(null);
// //     const [password, setPassword] = React.useState("");
// //     const [remeberMe, setRemeberMe] = React.useState(false);
// //     const errors: any = [];

// //     if (password != "") {
// //         if (password.length < 4) {
// //             errors.push("Password must be 4 characters or more.");
// //         }
// //         // if ((password.match(/[A-Z]/g) || []).length < 1) {
// //         //     errors.push("Password must include at least 1 upper case letter");
// //         // }
// //         // if ((password.match(/[^a-z]/gi) || []).length < 1) {
// //         //     errors.push("Password must include at least 1 symbol.");
// //         // }

// //     }
// //     const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
// //         e.preventDefault();
// //         const formData = new FormData(e.currentTarget);
// //         const data: Record<string, string> = Object.fromEntries(
// //             formData.entries()
// //         ) as Record<string, string>;
    
// //         data.password = password; 
// //         // data.remember = rememberMe;
    
// //         try {
// //             setSubmitted(data); 
// //             const response = await postLogin(data); 
// //             console.log('Login successful:', response);
            
// //         } catch (error) {
// //             console.error('Error during login:', error);
// //         }
// //     };
    

// //     return (
// //         <div>
// //             <Form className="w-full max-w-full" validationBehavior="native" onSubmit={onSubmit}>
// //                 <Input
// //                     isRequired
// //                     label="Username"
// //                     labelPlacement="outside"
// //                     name="userName"
// //                     placeholder="Enter your username"
// //                     type="text"
// //                     validate={(value) => {
// //                         if (value.length < 3) {
// //                             return "Username must be at least 3 characters long";
// //                         }

// //                         return value === "admin" ? "Nice try!" : null;
// //                     }}
// //                 />
// //                 <Input
// //                     errorMessage={() => (
// //                         <ul>
// //                             {errors.map((error, i) => (
// //                                 <li key={i}>{error}</li>
// //                             ))}
// //                         </ul>
// //                     )}
// //                     isInvalid={errors.length > 0}
// //                     label="Password"
// //                     labelPlacement="outside"
// //                     placeholder="Enter your password"
// //                     value={password}
// //                     onValueChange={setPassword}
// //                 />
// //                 <div className="flex items-center justify-between">
// //                     <div className="flex items-start justify-between">
// //                         <Checkbox
// //                             classNames={{
// //                                 label: "text-small",
// //                             }}
// //                             isInvalid={!!errors.terms}
// //                             name="terms"
// //                             validationBehavior="aria"
// //                             value="true"
// //                             onValueChange={() => setRemeberMe((prev) => !prev)}
// //                         >
// //                             Remember me
// //                         </Checkbox>
// //                     </div>
// //                 </div>
// //                 <Button type="submit" className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">Sign in</Button>
// //                 {submitted && (
// //                     <div className="text-small text-default-500">
// //                         You submitted: <code>{JSON.stringify(submitted)}</code>
// //                     </div>
// //                 )}
// //                 <a href="#" className="text-sm font-medium text-primary-600 hover:underline dark:text-primary-500">Forgot password?</a>
// //                 <p className="flex flex-row gap-1 w-full text-sm font-light text-gray-500 dark:text-gray-400">
// //                     Don’t have an account yet? <a href="#" className="self-start text-sm font-medium text-primary-600 hover:underline dark:text-primary-500">Register</a>
// //                     {/* <Link>Register</Link> */}
// //                 </p>
// //             </Form>
// //         </div>
// //     );
// // }
// 'use client'

// import AuthForm from "@/app/components/AuthForm";
// import { postLogin } from "@/app/services/auth";

// export default function LoginForm() {
//   const handleLoginSubmit = async (data: Record<string, string>) => {
//     await postLogin(data);
//   };

//   return (
//     <div>
//       <AuthForm isLogin onSubmit={handleLoginSubmit} />
//       <a
//         href="#"
//         className="text-sm font-medium text-primary-600 hover:underline"
//       >
//         Forgot password?
//       </a>
//       <p className="text-sm font-light text-gray-500">
//         Don’t have an account yet?{" "}
//         <a
//           href="/register"
//           className="text-sm font-medium text-primary-600 hover:underline"
//         >
//           Register
//         </a>
//       </p>
//     </div>
//   );
// }
