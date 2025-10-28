# Stripe Test Card Quick Reference

## Most Common Test Cards

### ✅ Success - Basic Card
```
Card Number: 4242 4242 4242 4242
Expiry: 12/34
CVC: 123
ZIP: 12345
```
**Use for**: Standard successful payment testing

---

### 🔐 Success - Requires Authentication (3D Secure)
```
Card Number: 4000 0025 0000 3155
Expiry: 12/34
CVC: 123
ZIP: 12345
```
**Use for**: Testing 3D Secure authentication flow
**Note**: Complete authentication in Stripe modal

---

### ❌ Declined - Generic Decline
```
Card Number: 4000 0000 0000 9995
Expiry: 12/34
CVC: 123
ZIP: 12345
```
**Use for**: Testing payment failure handling

---

### 💰 Declined - Insufficient Funds
```
Card Number: 4000 0000 0000 9995
Expiry: 12/34
CVC: 123
ZIP: 12345
```
**Use for**: Testing specific decline reason

---

## Additional Test Scenarios

### Charge Succeeds, Card Details Fail CVC Check
```
Card Number: 4000 0000 0000 0101
```

### Charge Succeeds, Card Details Fail ZIP Check
```
Card Number: 4000 0000 0000 0036
```

### Authentication Required Then Successful
```
Card Number: 4000 0027 6000 3184
```

### Always Authentication Required
```
Card Number: 4000 0000 0000 3220
```

---

## International Cards

### UK Visa
```
Card Number: 4000 0082 6000 0000
```

### EU Mastercard
```
Card Number: 5555 5555 5555 4444
```

---

## General Rules

- **Expiry Date**: Any future date (e.g., 12/34, 03/30, etc.)
- **CVC**: Any 3 digits (e.g., 123, 456, 789)
- **ZIP/Postal Code**: Any valid format (e.g., 12345, SW1A 1AA)
- **Name**: Any name (e.g., "Test User", "John Doe")

---

## Quick Testing Workflow

1. **Initial Test**: Use `4242 4242 4242 4242` for quick success test
2. **Auth Test**: Use `4000 0025 0000 3155` to test 3D Secure
3. **Failure Test**: Use `4000 0000 0000 9995` to test error handling
4. **Done!**: These three cards cover 90% of testing needs

---

## Stripe Dashboard

View test transactions:
- **Test Mode**: Toggle to "Test Mode" in top-right
- **Customers**: See all test customers
- **Payments**: View payment history
- **Events**: Check webhook delivery

---

## More Test Cards

Full list available at: https://stripe.com/docs/testing

---

**Pro Tip**: Save these cards in your password manager for quick access during testing!
