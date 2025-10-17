# File Upload Implementation Guide

## Overview
The file upload functionality is now fully implemented in the student Requirements screen. Students can upload images and PDF files for requirements that have file upload fields.

## How File Upload Works

### Required Documents Structure
Requirements can have different types of document fields in the `required_documents` JSON array:

```json
{
  "required_documents": [
    {
      "name": "Certificate of Good Moral",
      "type": "file"  // Shows file upload button
    },
    {
      "name": "I agree to the terms",
      "type": "checkbox"  // Shows checkbox
    }
  ]
}
```

### Document Types
- **`type: 'file'`** - Shows file upload button (📁 Choose File)
- **`type: 'checkbox'`** - Shows checkbox for confirmation
- **Default** - If no type is specified, defaults to 'checkbox'

## Creating Requirements with File Upload

### Option 1: Using the API

```javascript
POST /requirements
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Library Clearance",
  "description": "Submit proof of returned books",
  "due_date": "2025-12-31",
  "required_documents": [
    {
      "name": "Library Card",
      "type": "file"
    },
    {
      "name": "Book Return Receipt",
      "type": "file"
    }
  ],
  "department_id": 1
}
```

### Option 2: Using the Test Script

Run the provided test script to create a sample requirement:

```bash
cd backend
node create-test-requirement.js
```

### Option 3: Direct Database Insert

```sql
INSERT INTO requirements 
(title, description, due_date, required_documents, department_id, created_by) 
VALUES (
  'Finance Clearance',
  'Submit proof of payment',
  '2025-12-31',
  '[{"name":"Payment Receipt","type":"file"},{"name":"I confirm payment","type":"checkbox"}]',
  2,
  1
);
```

## File Upload Features

### For Students:
- **File Selection**: Click "📁 Choose File" to select documents
- **File Types**: Supports images (JPG, PNG) and PDFs
- **File Size Limit**: 2MB maximum per file
- **File Preview**: Shows file name and size after selection
- **Remove Option**: Can remove selected files before submission
- **Validation**: Automatic validation of file size and type

### Web Platform:
- Uses native HTML `<input type="file">` element
- Converts files to base64 for storage

### React Native Platform:
- Uses `expo-document-picker` for native file selection
- Stores file URI and metadata
- Full mobile integration

## Testing File Upload

1. **Start the Backend Server:**
   ```bash
   cd backend
   npm start
   ```

2. **Start the Frontend (Web):**
   ```bash
   cd frontend
   npx expo start --web
   ```

3. **Login as a Student**

4. **Navigate to Requirements Tab**

5. **Look for the Test Requirement:**
   - Find "Graduation Clearance" or any requirement with file upload
   - You'll see "📁 Choose File" buttons

6. **Test Upload:**
   - Click "Choose File"
   - Select an image or PDF
   - See file information displayed
   - Submit the requirement

## Troubleshooting

### File Upload Button Not Showing?

**Check the requirement data:**
```javascript
// The requirement must have documents with type: 'file'
{
  "required_documents": [
    { "name": "Document Name", "type": "file" }  // ✅ Correct
  ]
}

// These won't show file upload:
{
  "required_documents": ["Document Name"]  // ❌ String, not object
}
{
  "required_documents": [
    { "name": "Document Name" }  // ❌ No type specified (defaults to checkbox)
  ]
}
{
  "required_documents": [
    { "name": "Document Name", "type": "checkbox" }  // ❌ Checkbox type
  ]
}
```

### File Upload Not Working?

1. **Check file size**: Must be under 2MB
2. **Check file type**: Only images and PDFs are supported
3. **Check browser console**: For any error messages
4. **Verify backend is running**: Check http://localhost:3000/health

## Implementation Details

### Frontend Code
- **Location**: `frontend/screens/RequirementsScreen.js`
- **Lines 94-125**: `pickDocument()` function for React Native
- **Lines 270-303**: File upload UI components
- **Lines 365-418**: File upload styles

### Backend Code
- **Location**: `backend/src/routes/requirementsRoutes.js`
- **Lines 107-134**: Create requirement endpoint
- **Lines 138-151**: Submit requirement endpoint

### Database Schema
- **Table**: `requirements`
- **Field**: `required_documents` (JSON)
- **Storage**: File data stored as base64 in submission responses

## Example Requirements

### Example 1: Library Clearance
```json
{
  "title": "Library Clearance",
  "description": "Return all borrowed books",
  "required_documents": [
    { "name": "Library Card", "type": "file" },
    { "name": "Book Return Slip", "type": "file" }
  ]
}
```

### Example 2: Finance Clearance
```json
{
  "title": "Finance Clearance",
  "description": "Clear all financial obligations",
  "required_documents": [
    { "name": "Payment Receipt", "type": "file" },
    { "name": "Tuition Fee Receipt", "type": "file" },
    { "name": "I confirm all payments are complete", "type": "checkbox" }
  ]
}
```

### Example 3: Department Clearance
```json
{
  "title": "CS Department Clearance",
  "description": "Return equipment and submit projects",
  "required_documents": [
    { "name": "Equipment Return Form", "type": "file" },
    { "name": "Final Project Report", "type": "file" },
    { "name": "Lab Equipment Photo", "type": "file" },
    { "name": "I returned all items", "type": "checkbox" }
  ]
}
```

## Notes

- File upload is **fully implemented and working**
- Works on both **web and React Native platforms**
- Supports **multiple file types** (images, PDFs)
- Includes **validation** and **error handling**
- **Cross-platform compatible**

For questions or issues, check the implementation in `RequirementsScreen.js`.

