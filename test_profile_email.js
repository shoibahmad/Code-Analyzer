// Profile Page Email Display - Quick Test Script
// Copy and paste this into your browser console on the profile page

console.log('=== Profile Page Email Display Test ===\n');

// 1. Check if user is authenticated
console.log('1. Authentication Check:');
console.log('   window.currentUser:', window.currentUser);
if (window.currentUser) {
    console.log('   ✅ User authenticated');
    console.log('   Email:', window.currentUser.email);
    console.log('   Display Name:', window.currentUser.displayName);
    console.log('   UID:', window.currentUser.uid);
} else {
    console.log('   ❌ No user authenticated');
}

console.log('\n2. DOM Elements Check:');

// 2. Check email elements
const userEmail = document.getElementById('userEmail');
const userEmailInfo = document.getElementById('userEmailInfo');
console.log('   #userEmail element:', userEmail);
console.log('   #userEmail text:', userEmail?.textContent);
console.log('   #userEmailInfo element:', userEmailInfo);
console.log('   #userEmailInfo text:', userEmailInfo?.textContent);

// 3. Check display name elements
const displayNames = document.querySelectorAll('.user-display-name');
console.log('\n3. Display Name Elements:');
console.log('   Found', displayNames.length, 'elements with class .user-display-name');
displayNames.forEach((el, index) => {
    console.log(`   Element ${index + 1}:`, el.textContent);
});

// 4. Check avatar
const avatar = document.getElementById('profileAvatar');
console.log('\n4. Avatar Element:');
console.log('   #profileAvatar:', avatar);
console.log('   Avatar HTML:', avatar?.innerHTML);

// 5. Check user ID
const userId = document.getElementById('userId');
console.log('\n5. User ID Element:');
console.log('   #userId:', userId);
console.log('   User ID text:', userId?.textContent);

// 6. Verification
console.log('\n=== Verification ===');
const emailCorrect = userEmail?.textContent === window.currentUser?.email;
const emailInfoCorrect = userEmailInfo?.textContent === window.currentUser?.email;
const nameCorrect = Array.from(displayNames).every(el => el.textContent === window.currentUser?.displayName);

console.log('✓ Email in header:', emailCorrect ? '✅ CORRECT' : '❌ INCORRECT');
console.log('✓ Email in info card:', emailInfoCorrect ? '✅ CORRECT' : '❌ INCORRECT');
console.log('✓ Display names:', nameCorrect ? '✅ CORRECT' : '❌ INCORRECT');

if (emailCorrect && emailInfoCorrect && nameCorrect) {
    console.log('\n🎉 ALL CHECKS PASSED! Profile page is displaying correctly.');
} else {
    console.log('\n⚠️ SOME CHECKS FAILED. Try running: window.updateUserName()');
}

// 7. Manual fix function
console.log('\n=== Manual Fix ===');
console.log('If data is not showing, run this command:');
console.log('window.updateUserName()');
console.log('\nOr force update with:');
console.log(`
if (window.currentUser) {
    document.getElementById('userEmail').textContent = window.currentUser.email;
    document.getElementById('userEmailInfo').textContent = window.currentUser.email;
    document.querySelectorAll('.user-display-name').forEach(el => el.textContent = window.currentUser.displayName);
}
`);
