import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { AlertDescription } from '@/components/ui/alert'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useForm } from 'react-hook-form'
import AuthContext from "../context/AuthProvider"
import { useContext } from "react"
import { useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";


export function LoginForm({
  className,
  ...props
}) {

  const { register, handleSubmit, formState: {errors, isSubmitting} }  = useForm()
  const {login} = useContext(AuthContext)

  // Modal state and handlers must be inside the component
  const [modalContent, setModalContent] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleOpenModal = (type) => {
    if (type === "terms") {
      setModalContent(
        <div>
          <h2 className="text-lg font-bold mb-2">Terms & Conditions</h2>
          <div className="overflow-y-auto max-h-96 text-left">
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. (Replace with your real Terms & Conditions)</p>
          </div>
        </div>
      );
    } else if (type === "privacy") {
      setModalContent(
        <div>
          <h2 className="text-lg font-bold mb-2">Privacy Policy</h2>
          <div className="overflow-y-auto max-h-96 text-left">
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. (Replace with your real Privacy Policy)</p>
          </div>
        </div>
      );
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalContent(null);
  };
  const formSubmit = async (data) => {
    await login(data)
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(formSubmit)}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <Label htmlFor='email'>Email</Label>
                <Input {...register('email', {
                    required: 'Email is required'
                  })} id="email" type="email" placeholder="m@example.com"/>
                {errors.email && (
                  <AlertDescription className="text-red-500">{errors.email.message}</AlertDescription>
                )}
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input {...register('password', {
                      required: 'Password is required'
                    })} id="password" type="password"/>
                </div>
                <div className="flex justify-between items-center">{errors.password && (
                  <AlertDescription className="text-red-500">{errors.password.message}</AlertDescription>)}
                  <a href="#" className="ml-auto inline-block text-sm underline-offset-4 hover:underline">Forgot your password?</a>
                </div>
              <div className="flex flex-col gap-3">
                <Button disabled={isSubmitting} type="submit" className="w-full">
                  Login
                </Button>
              </div>
              
            </div>
            <div className="text-center text-sm">
          <div className="">
            <div className="flex items-start mt-3 text-sm">
              <input className="mt-1 h-10 w-10" type="checkbox" required />
              <label htmlFor="remember-me" className="ml-2">By logging in, you confirm you have reviewed, understood, and agree to abide by the current <button type="button" className="text-blue-500 underline" onClick={() => handleOpenModal("terms")}>Terms & Conditions</button> and <button type="button" className="text-blue-500 underline" onClick={() => handleOpenModal("privacy")}>Privacy Policy</button>.</label>
            </div>
            <div className="flex justify-center mt-4">
              <ReCAPTCHA
                sitekey="YOUR_RECAPTCHA_SITE_KEY"
                onChange={(value) => {
                  // You can handle the captcha value here
                  // e.g., setCaptchaValue(value);
                }}
              />
            </div>
          </div>
            </div>
          </form>
          {/* Modal rendering moved to be a centered overlay */}
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
              <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full relative border border-gray-300">
                <button
                  className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
                  onClick={handleCloseModal}
                  aria-label="Close"
                >
                  &times;
                </button>
                {modalContent}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}