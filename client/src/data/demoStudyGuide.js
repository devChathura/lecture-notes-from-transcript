export const DEMO_LECTURE = {
  fileName: "authentication-lecture.vtt",
  fileSize: 18_842,
  fileType: ".VTT",
  source: "demo",
};

export const DEMO_STUDY_GUIDE = `# Authentication and Access Control

## Summary

Authentication confirms **who a user is**, while authorization determines **what that user is allowed to access**. Secure systems combine reliable identity checks, carefully scoped permissions, and safe credential storage.

## Key Ideas

- Authentication verifies identity using credentials such as passwords, passkeys, or security tokens.
- Authorization checks permissions after a user has been authenticated.
- Passwords should be stored with a slow, salted password-hashing algorithm.
- Sessions and access tokens should expire and be invalidated when they are no longer needed.
- The principle of least privilege gives users only the permissions required for their role.

## Key Terms

- **Authentication:** The process of verifying a user's identity.
- **Authorization:** The process of deciding which resources an authenticated user can access.
- **Hashing:** A one-way transformation used to store password representations safely.
- **Session:** Server-managed state that keeps a user signed in across requests.
- **Access token:** A time-limited credential presented when requesting protected resources.

## Revision Questions

1. What is the difference between authentication and authorization?
2. Why should passwords be hashed with a salt?
3. How does the principle of least privilege reduce security risk?
4. When should a session or access token be invalidated?
`;
