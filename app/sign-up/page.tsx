import {
  Button,
  Container,
  HyperLink,
  InputField,
  UnauthCard,
} from "@/components";

export default function SignUp() {
  return (
    <Container className="bg-primary">
      <UnauthCard
        title="Create Account"
        subtitle="Join Limit and start mastering your personal finances today."
      >
        <div className="space-y-4">
          <InputField
            label="Full Name"
            type="text"
            placeholder="John Doe"
            autoComplete="off"
          />
          <InputField
            label="Email Address"
            type="email"
            placeholder="john@example.com"
            autoComplete="off"
          />
          <InputField label="Password" type="password" placeholder="••••••••" />
          <InputField
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
          />
        </div>

        <div className="space-y-6 mt-8">
          <p className="text-center text-xs text-gray-500 leading-relaxed">
            By continuing, you agree to our{" "}
            <HyperLink
              size="sm"
              href="/terms"
              className="inline decoration-gray-300"
            >
              Terms of Use
            </HyperLink>{" "}
            and{" "}
            <HyperLink
              size="sm"
              href="/privacy"
              className="inline decoration-gray-300"
            >
              Privacy Policy
            </HyperLink>
            .
          </p>

          <Button size="lg" variant="primary" className="w-full">
            Create Account
          </Button>

          <div className="flex justify-center text-sm">
            <span className="text-gray-600">
              Already have an account?{" "}
              <HyperLink href="/login" className="font-bold">
                Log In
              </HyperLink>
            </span>
          </div>
        </div>
      </UnauthCard>
    </Container>
  );
}
