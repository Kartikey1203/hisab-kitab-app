# Bulk Transaction Feature

## Overview
Added a new bulk transaction feature that allows users to add the same transaction to multiple people at once.

## Features Added

### Backend Changes
1. **New Route**: `POST /api/transactions/bulk`
   - Accepts `personIds` array along with transaction details
   - Creates transactions for each selected person
   - Handles counterpart mirroring for linked friends
   - Sends notifications to counterpart users

### Frontend Changes
1. **New Component**: `BulkTransactionForm.tsx`
   - Modal form for selecting multiple people
   - Search functionality to filter people
   - Select all/deselect all functionality
   - Confirmation dialog before submission

2. **Updated Components**:
   - Added bulk transaction button to FAB menu in `App.tsx`
   - Added API method `addBulkTransaction` in `api.ts`
   - Enhanced error handling and user feedback

## Usage
1. Click the + button (FAB) in the bottom right
2. Select "Bulk Transaction" from the menu
3. Enter transaction details (purpose, amount, who paid)
4. Search and select the people involved
5. Confirm the transaction

## Example Use Case
- You and friends go to a restaurant
- You pay for everyone's meal (₹200 each)
- Instead of adding individual transactions:
  - Enter "Restaurant meal" as purpose
  - Enter ₹200 as amount
  - Select "I Paid"
  - Select all friends who were present
  - Submit once to add to all selected people

## Technical Details

### API Endpoint
```
POST /api/transactions/bulk
Content-Type: application/json
Authorization: Bearer <token>

{
  "amount": 200,
  "description": "Restaurant meal",
  "type": "credit",
  "date": "2025-11-13T10:30:00.000Z",
  "personIds": ["person_id_1", "person_id_2", "person_id_3"]
}
```

### Response
```json
{
  "message": "3 transactions created successfully",
  "transactions": [
    // Array of created transaction objects
  ]
}
```

## Security Considerations
- All selected persons must belong to the authenticated user
- Proper validation of input data
- Counterpart notifications only sent to linked friends
- Transaction mirroring follows existing business logic

## Error Handling
- Validates at least one person is selected
- Validates positive amount and non-empty purpose
- Shows descriptive error messages
- Graceful fallback if data reload fails after submission