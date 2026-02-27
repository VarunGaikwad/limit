import {
  Button,
  Container,
  HyperLink,
  InputField,
  UnauthCard,
} from "@/components";

export default function Login() {
  return (
    <Container className="bg-primary">
      <UnauthCard
        title="Welcome Back"
        subtitle="Log in to manage your budget and stay on track."
      >
        <div className="space-y-4">
          <InputField
            label="Email Address"
            type="email"
            placeholder="john@example.com"
            autoComplete="off"
          />
          <InputField label="Password" type="password" placeholder="••••••••" />

          <div className="flex justify-end">
            <HyperLink size="sm" variant="muted" href="/forgot-password">
              Forgot Password?
            </HyperLink>
          </div>
        </div>

        <div className="space-y-4 mt-8">
          <Button
            className="w-full"
            variant="primary"
            size="lg"
            isLoading={false}
          >
            Log In
          </Button>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm uppercase">
              <span className="bg-snow px-2 text-gray-400">New to Limit?</span>
            </div>
          </div>

          <Button
            href="/sign-up"
            className="w-full"
            variant="default"
            size="lg"
          >
            Create Free Account
          </Button>
        </div>
      </UnauthCard>
    </Container>
  );
}
