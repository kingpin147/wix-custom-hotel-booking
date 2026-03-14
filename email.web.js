import { webMethod, Permissions } from 'wix-web-module';
import { contacts, triggeredEmails } from 'wix-crm-backend';

export const sendQuoteEmailWithContact = webMethod(Permissions.Anyone, async ( firstName, lastName, email, GuestNames, accomodation) => {
    try {
        
        console.log("🟨 Input received:", { firstName, lastName, email, GuestNames, accomodation });

        // ✅ Validate input
        if (!firstName || !lastName || !email) {
            throw new Error("Missing required fields: name or email.");
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error("Invalid email format.");
        }

        let name = firstName + " " + lastName;

        // 👥 Create contact
        const contactInfo = {
            name: { first: firstName, last: lastName },
            emails: [{ email, tag: "WORK", primary: true }]
        };

        const options = {
            allowDuplicates: true,
            suppressAuth: true
        };

        const contact = await contacts.createContact(contactInfo, options);
        const contactId = contact._id;

        if (!contactId) throw new Error("Failed to retrieve contact ID.");
        // 📤 Send triggered email
        const emailResult = await triggeredEmails.emailContact('VDon4WA', contactId, {
  variables: {
        GuestName: name,
        Accommodation: accomodation,
        NamesGuest: GuestNames,
        SITE_URL: "https://www.padelparadiseretreats.com/terms-conditions"
  }
});
    // also send email to admin
  const emailResult1 = await triggeredEmails.emailContact('VDon4WA', "e93ccddf-f6ce-4a28-b961-87c4163db864", {
  variables: {
        GuestName: name,
        Accommodation: accomodation,
        NamesGuest: GuestNames,
        SITE_URL: "https://www.padelparadiseretreats.com/terms-conditions"
  }
});

        console.log("📧 Email sent successfully.");
        return { success: true, message: "Email sent successfully.", result: emailResult };

    } catch (error) {
        console.error("❌ Error in sendQuoteEmailWithContact:", error);
        return { success: false, message: error.message || "Unable to send quote email." };
    }
});