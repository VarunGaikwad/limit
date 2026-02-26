import {
  Button,
  Container,
  HyperLink,
  InputField,
  UnauthCard,
} from "@/components";

export default function Login() {
  return (
    <Container className="bg-primary text-gray-800">
      <UnauthCard title="Welcome">
        <InputField label="Username or Email" type="text" autoComplete="off" />
        <InputField label="Password" type="password" />
        <div className="space-y-1.5">
          <div className="flex justify-center">
            <Button
              className="w-11/12"
              variant="primary"
              size="sm"
              isLoading={false}
            >
              Log In
            </Button>
          </div>
          <div className="flex justify-center">
            <HyperLink size="sm" variant="muted" href="/forgot-password">
              Forget Password?
            </HyperLink>
          </div>
          <div className="flex justify-center">
            <Button
              href="/sign-up"
              className="w-11/12"
              variant="primary"
              size="sm"
              isLoading={false}
            >
              Sign Up
            </Button>
          </div>
        </div>
      </UnauthCard>
    </Container>
  );
}
