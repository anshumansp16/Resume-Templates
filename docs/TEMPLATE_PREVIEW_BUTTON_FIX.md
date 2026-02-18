# Template Preview Modal Button Fix

**Issue:** The "Use this template" button was not visible when viewing template previews.

**Date Fixed:** February 1, 2026

---

## Problem

When users clicked "Preview" on a template card, the modal showed the resume preview but the "Use This Template" button at the bottom was not visible - it was being pushed out of view by the large preview image.

## Root Cause

The preview container had layout issues:
- Inner div had `h-full` causing overflow beyond available space
- No height constraint on the preview image container
- Missing `overflow-hidden` on the modal content
- Preview section wasn't properly constrained with flex layout

## Solution

Fixed in: `client/components/template-preview-modal.tsx`

### Changes Made:

1. **Added overflow control to DialogContent** (line 37)
   - Added `overflow-hidden` to prevent content overflow

2. **Fixed preview section flex layout** (line 52)
   - Added `overflow-y-auto` to allow scrolling if needed
   - Added `min-h-0` to properly respect flex constraints

3. **Removed height conflict** (line 61)
   - Removed `h-full` from inner preview container
   - This was causing the container to exceed available space

4. **Added vertical centering** (line 63)
   - Added `my-auto` to center preview vertically

5. **Constrained preview image height** (line 68)
   - Changed `maxHeight: '100%'` to `maxHeight: 'calc(95vh - 200px)'`
   - Ensures preview never takes more space than available
   - Reserves ~200px for header + footer

## Result

Now when users preview a template:
- ✅ Resume preview is properly sized and centered
- ✅ "Use this template" button is always visible at bottom
- ✅ Button is clickable and navigates to customize page
- ✅ Modal maintains proper layout on all screen sizes
- ✅ If preview is too large, the middle section scrolls (not the whole modal)

## Testing

Build Status: ✅ PASSING
- No TypeScript errors
- No compilation errors
- All routes working correctly

To test manually:
1. Run `npm run dev` in client directory
2. Navigate to http://localhost:3000
3. Click "Preview" on any template card
4. Verify the modal shows:
   - Template header at top
   - Resume preview in middle (scrollable if needed)
   - "Use this template" button at bottom
5. Click the button and verify it navigates to `/customize/[templateId]`

## Code Reference

File: `client/components/template-preview-modal.tsx`

Key lines:
- Line 37: DialogContent with overflow control
- Line 52: Preview section with proper flex constraints
- Line 61: Preview container without height overflow
- Line 68: Preview image with calculated max height
- Lines 94-104: Footer with button (unchanged, now visible)
