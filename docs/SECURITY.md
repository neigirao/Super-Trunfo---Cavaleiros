# Security Documentation

## Overview

This document outlines the security measures implemented in the Cavaleiros dos Elementos application to protect user data, prevent common vulnerabilities, and ensure a safe gaming experience.

## Authentication & Authorization

### Supabase Authentication
- **Provider**: Google OAuth via Supabase
- **Session Management**: Automatic token refresh with secure storage
- **Protected Routes**: All game-related routes require authentication

### Row Level Security (RLS)
All database tables have RLS policies enabled:

#### User Data Protection
- Users can only read/write their own profile data
- Users can only access their own card collections
- Users can only view their own achievements and progress

#### Public Data
- Element cards are publicly readable
- Rankings are publicly viewable
- Game statistics are aggregated and anonymized

### Admin Access
- Admin role verification through `is_admin()` function
- Admin-only tables: `admin_notifications`, `tutorials`
- Restricted operations require admin role check

## Input Validation & Sanitization

### Client-Side Validation
Located in `src/lib/security.ts`:

1. **HTML Sanitization**: Prevents XSS attacks
   ```typescript
   sanitizeHTML(userInput)
   ```

2. **Email Validation**: RFC-compliant email checking
   ```typescript
   isValidEmail(email)
   ```

3. **Length Validation**: Prevents buffer overflow
   ```typescript
   isValidLength(input, min, max)
   ```

4. **Card Input Validation**:
   - Name: 1-100 characters
   - Symbol: 1-5 characters
   - Atomic Number: 1-118
   - Atomic Mass: 0-300

5. **Battle Input Validation**:
   - Attribute must be from allowed list
   - Card ID must be valid UUID

### Rate Limiting
Client-side rate limiter prevents abuse:
```typescript
rateLimiter.isAllowed(key, maxAttempts, windowMs)
```

**Use Cases**:
- Battle actions: 10 per minute
- Form submissions: 5 per minute
- API calls: 30 per minute

## Data Protection

### Sensitive Data
- User emails stored securely in Supabase Auth
- Passwords managed by Supabase (bcrypt hashing)
- No sensitive data in localStorage (only preferences)

### Personal Information
- Minimal data collection (email, name, avatar)
- No credit card or payment information stored
- User-generated content sanitized before storage

## Known Security Warnings

From Supabase linter:

1. **OTP Expiry**: Consider reducing OTP expiry time
2. **Leaked Password Protection**: Enable in production
3. **Postgres Version**: Keep database updated

These should be addressed before production deployment.

## Security Best Practices Implemented

### Frontend
✅ XSS Prevention via HTML sanitization
✅ CSRF Protection via Supabase built-in tokens
✅ Input validation on all forms
✅ Rate limiting on user actions
✅ Secure random token generation
✅ UUID validation for database IDs

### Backend (Supabase)
✅ RLS policies on all tables
✅ Secure authentication with OAuth
✅ Automatic SQL injection prevention
✅ HTTPS enforced
✅ Database functions with SECURITY DEFINER

### Infrastructure
✅ Environment variables for secrets
✅ No hardcoded credentials in code
✅ Secure communication (HTTPS)
✅ CORS properly configured

## Security Testing

### Automated Tests
- Input validation tests: `src/lib/__tests__/security.test.ts`
- Component security tests included in unit tests
- Rate limiter functionality tests

### Manual Testing Checklist
- [ ] Test XSS prevention in all input fields
- [ ] Verify RLS policies block unauthorized access
- [ ] Test rate limiting effectiveness
- [ ] Confirm HTTPS enforcement
- [ ] Validate UUID format checking
- [ ] Test OAuth flow security

## Incident Response

### Reporting Security Issues
Users can report security concerns via:
1. Support ticket system (in-app)
2. Direct email to admin
3. Bug report form with security category

### Response Process
1. **Assessment**: Evaluate severity within 24h
2. **Containment**: Disable affected features if critical
3. **Fix**: Implement and test security patch
4. **Deploy**: Push fix to production
5. **Notify**: Inform affected users if data breach

## Production Security Checklist

Before deploying to production:

- [ ] Enable leaked password protection in Supabase
- [ ] Reduce OTP expiry time
- [ ] Upgrade Postgres to latest version
- [ ] Review all RLS policies
- [ ] Enable Supabase security logs
- [ ] Set up monitoring for suspicious activity
- [ ] Implement backend rate limiting
- [ ] Add Content Security Policy headers
- [ ] Enable HSTS (HTTP Strict Transport Security)
- [ ] Configure secure cookie settings
- [ ] Set up automated security scanning
- [ ] Review and update dependencies
- [ ] Enable database backups
- [ ] Set up audit logging

## Compliance

### LGPD (Brazil)
- User consent for data collection
- Data deletion on account removal
- Privacy policy available
- Data portability support

### GDPR (EU Users)
- Right to access personal data
- Right to deletion (RTBF)
- Data minimization principle
- Transparent privacy policy

## Security Dependencies

Keep these packages updated:
- `@supabase/supabase-js`: Authentication & database
- `react-router-dom`: Routing (XSS prevention)
- All `@radix-ui` components: Secure UI primitives

## Monitoring & Logging

### Security Events to Monitor
- Failed authentication attempts
- Unusual API call patterns
- Database query failures
- RLS policy violations
- Rate limit triggers

### Logging
- Supabase provides built-in logging
- Client-side errors logged to console (dev)
- Consider adding Sentry for production

## Future Enhancements

1. **Two-Factor Authentication**: Add optional 2FA
2. **Session Management**: Force logout on suspicious activity
3. **API Key Rotation**: Implement automatic rotation
4. **Penetration Testing**: Regular security audits
5. **WAF**: Web Application Firewall for production
6. **DDoS Protection**: Cloudflare or similar service
7. **Security Headers**: CSP, X-Frame-Options, etc.
8. **Audit Logs**: Detailed user action tracking

## Resources

- [Supabase Security Best Practices](https://supabase.com/docs/guides/platform/going-into-prod#security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [React Security Checklist](https://reactjs.org/docs/security.html)

---

**Last Updated**: 2024-11-17
**Security Contact**: admin@cavaleiros-elementos.com
