import type { ContactFormInput, ContactValidationErrors } from "@narendra/types";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateContactInput(input: ContactFormInput): {
  valid: boolean;
  errors: ContactValidationErrors;
} {
  const errors: ContactValidationErrors = {};

  const name = input.name.trim();
  const email = input.email.trim();
  const organization = input.organization.trim();
  const message = input.message.trim();

  if (name.length < 2) {
    errors.name = "Please enter your full name (at least 2 characters).";
  } else if (name.length > 100) {
    errors.name = "Name must be 100 characters or fewer.";
  }

  if (email.length === 0) {
    errors.email = "Please enter your email address.";
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (organization.length > 120) {
    errors.organization = "Organization name must be 120 characters or fewer.";
  }

  if (message.length < 20) {
    errors.message = "Please include at least 20 characters describing your inquiry.";
  } else if (message.length > 2000) {
    errors.message = "Message must be 2,000 characters or fewer.";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
