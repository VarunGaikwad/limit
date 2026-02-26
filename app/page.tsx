import { Button, Container, HyperLink } from "@/components";
import { Landmark } from "lucide-react";

export default function Home() {
  return (
    <Container className="bg-gray-100">
      <div className="space-y-5">
        <div className="text-center space-y-2.5">
          <Landmark className="size-36 text-primary mx-auto" />
          <span className="font-extrabold text-5xl text-primary select-none">
            LIMIT
          </span>
        </div>
        <div className="flex flex-col gap-2.5 text-center">
          <Button variant="primary" size="lg" href="/login">
            Log In
          </Button>
          <Button variant="default" size="lg" href="/sign-up">
            Sign Up
          </Button>
          <HyperLink size="sm" href="/forgot-password">
            Forgot Password?
          </HyperLink>
        </div>
      </div>
    </Container>
  );
}
