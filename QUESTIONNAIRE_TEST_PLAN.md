# Questionnaire End-to-End Test Plan

## Test Overview
Comprehensive testing of the Community Alignment Survey questionnaire to ensure robustness, data integrity, and proper validation.

---

## 1. Form Validation Tests

### 1.1 Required Fields
**Fields that MUST be filled:**
- ✅ Full Name
- ✅ Email (with format validation)
- ✅ Phone Number
- ✅ Question 2: "New Earth" meaning (50+ words)
- ✅ Question 4: Nervous systems (50+ words)
- ✅ Question 5: Sovereignty (30+ words)
- ✅ Question 7: Authenticity story (75+ words)
- ✅ Question 8: Trigger response (50+ words)
- ✅ Question 9: Active wound (50+ words)
- ✅ Question 11: Gift (50+ words)

**Test Cases:**
- [ ] Try to submit with empty required fields → Should show validation error
- [ ] Try to submit with invalid email → Should show "valid email" error
- [ ] Try to submit with word count below minimum → Should prevent submission

### 1.2 Optional Fields
**Fields that can be empty:**
- Question 1: Discovery details
- Question 3: Intention details
- Question 6: Inner work "Other"
- Question 15: Additional info
- Question 16: Birth date, time, location (all optional)

**Test Cases:**
- [ ] Submit form without optional fields → Should succeed
- [ ] Submit with only some optional fields filled → Should succeed

### 1.3 Word Count Enforcement
**Current Issue Found:** ⚠️ TextareaWithCounter shows visual feedback but doesn't enforce minimums!

**Word Count Requirements:**
- 50 words: Questions 2, 4, 8, 9, 11
- 30 words: Question 5
- 75 words: Question 7

**Test Cases:**
- [ ] Enter 49 words in 50-word field → Should prevent submission
- [ ] Enter 50 words in 50-word field → Should allow submission
- [ ] Enter 29 words in 30-word field → Should prevent submission
- [ ] Enter 74 words in 75-word field → Should prevent submission

---

## 2. API Endpoint Tests

### 2.1 Successful Submission
**Endpoint:** POST `/api/questionnaire`

**Test Cases:**
- [ ] Submit valid data → Should return `{ success: true }`
- [ ] Verify contact created in `contacts` table
- [ ] Verify response stored in `questionnaireResponses` table
- [ ] Verify activity logged in `contactActivities` table
- [ ] Verify contact metadata updated with `questionnaireCompleted: true`

### 2.2 Error Handling
**Test Cases:**
- [ ] Submit without name → Should return 400 error
- [ ] Submit without email → Should return 400 error
- [ ] Submit with invalid email format → Should return 400 error with message
- [ ] Submit with malformed JSON → Should return 500 error

### 2.3 Duplicate Submissions
**Test Cases:**
- [ ] Submit same email twice → Should update existing contact, create new response
- [ ] Submit with contactId from waitlist → Should update that specific contact
- [ ] Submit with invalid contactId → Should fall back to email lookup

---

## 3. Data Storage Tests

### 3.1 Contacts Table
**Verify:**
- [ ] Email is unique
- [ ] Name, phone stored correctly
- [ ] `questionnaireCompleted` in metadata = true
- [ ] `questionnaireCompletedAt` timestamp set
- [ ] `status` = "lead"
- [ ] `tags` includes "questionnaire"
- [ ] `firstSource` set correctly

### 3.2 Questionnaire Responses Table
**Verify:**
- [ ] All checkbox arrays stored as JSONB
- [ ] All narrative text stored in `narratives` JSONB object
- [ ] Birth date, time, location stored correctly (even if empty)
- [ ] ContactId references correct contact
- [ ] Created timestamp set

### 3.3 Contact Activities Table
**Verify:**
- [ ] Activity type = "questionnaire_submit"
- [ ] Description set correctly
- [ ] Metadata includes questionnaireId
- [ ] Timestamp recorded

---

## 4. Edge Cases

### 4.1 Special Characters
**Test Cases:**
- [ ] Submit with emoji in text fields
- [ ] Submit with quotes, apostrophes
- [ ] Submit with HTML/script tags → Should be sanitized
- [ ] Submit with very long text (>10,000 characters)

### 4.2 Boundary Values
**Test Cases:**
- [ ] Exactly minimum word count (30, 50, 75)
- [ ] Exactly minimum word count + 1
- [ ] Empty optional fields vs null vs undefined
- [ ] Very short phone number vs very long

### 4.3 Concurrent Submissions
**Test Cases:**
- [ ] Submit same email from two tabs simultaneously
- [ ] Database handles race condition correctly

### 4.4 Invalid Data Types
**Test Cases:**
- [ ] Send string instead of array for checkboxes
- [ ] Send array instead of string for text
- [ ] Send non-ISO date format
- [ ] Send invalid time format

---

## 5. User Experience Tests

### 5.1 Visual Feedback
**Test Cases:**
- [ ] Word counter updates in real-time
- [ ] Green checkmark appears when requirement met
- [ ] Red/neutral color when below minimum
- [ ] Submit button disabled until form valid?

### 5.2 Pre-fill from Waitlist
**Test Cases:**
- [ ] Navigate with URL params → Name, email, phone pre-filled
- [ ] Pre-filled fields are editable
- [ ] ContactId passed correctly to API

### 5.3 Success State
**Test Cases:**
- [ ] Success message displays after submission
- [ ] Form resets after successful submission
- [ ] User cannot double-submit

---

## 6. Critical Issues Found

### ⚠️ Issue #1: Word Count Not Enforced
**Problem:** TextareaWithCounter shows visual feedback but doesn't prevent form submission if word count is below minimum.

**Solution Needed:**
- Add custom validation to prevent form submission
- Use `setCustomValidity()` on textarea
- Show error message on submit attempt

### ⚠️ Issue #2: Birth Time Format
**Problem:** BirthTimePicker outputs 24-hour format (HH:MM) but API expects string.

**Status:** ✅ Should work - API accepts any string format

---

## Test Execution Plan

1. **Manual Testing** (5-10 minutes)
   - Fill form with valid data → Submit → Verify success
   - Fill form with invalid data → Verify errors
   - Test optional fields → Verify success

2. **Database Verification** (2-3 minutes)
   - Query `contacts` table → Verify record
   - Query `questionnaireResponses` → Verify data
   - Query `contactActivities` → Verify activity logged

3. **Edge Case Testing** (5 minutes)
   - Test special characters
   - Test boundary values
   - Test duplicate submissions

**Total Estimated Time:** 15-20 minutes

---

## Critical Fixes Needed

1. **TextareaWithCounter** - Add word count enforcement
2. **Form validation** - Ensure all required fields have HTML5 validation
3. **Submit button** - Consider disabling until form is valid

