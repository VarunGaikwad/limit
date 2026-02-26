import {
  Button,
  Container,
  HyperLink,
  InputField,
  UnauthCard,
} from "@/components";

export default function SignUp() {
  return (
    <Container className="bg-primary text-gray-800">
      <UnauthCard title="Sign Up">
        <InputField label="Full Name" type="text" autoComplete="off" />
        <InputField label="Email" type="text" autoComplete="off" />
        <InputField label="Mobile Number" type="tel" autoComplete="off" />
        <InputField label="Date of Birth" type="date" autoComplete="off" />
        <InputField label="Password" type="password" />
        <InputField label="Confirm Password" type="password" />
        <div className="space-y-1.5">
          <div className="flex justify-center">
            <span className="text-center">
              By Continue you agree to{" "}
              <span className="font-bold">Terms of Use</span> and{" "}
              <span className="font-bold">Privacy Policy</span>
            </span>
          </div>
          <div className="flex justify-center">
            <Button size="sm" variant="primary" className="w-11/12">
              Sign Up
            </Button>
          </div>
          <div className="flex justify-center">
            <span>
              Already have an account?{" "}
              <HyperLink size="sm" href="/login">
                Log In
              </HyperLink>
            </span>
          </div>
        </div>
      </UnauthCard>
    </Container>
  );
}
