import wixWindow from 'wix-window';

$w.onReady(function () {
    console.log("Booking page ready");
    
    // Set up the booking repeater
    $w("#bookingRepeater").onItemReady(($item, itemData, index) => {
        console.log("Item ready in repeater:", index, itemData);
        
        // Find the button - we'll try common IDs if 'bookNow' isn't correct
        const buttonId = "bookNow"; // Adjust if your button ID is different
        const button = $item(`#${buttonId}`);
        
        if (button) {
            button.onClick(() => {
                console.log("Book Now clicked for:", itemData.packageName);
                // Open the lightbox and pass the current room's data
                wixWindow.openLightbox("bookingform", itemData)
                    .then((data) => {
                        console.log("Lightbox closed with data:", data);
                    })
                    .catch((err) => {
                        console.error("Error opening lightbox:", err);
                    });
            });
        } else {
            console.warn(`Button with ID '${buttonId}' not found in repeater item.`);
        }
    });

    // If repeater is connected to a dataset, we might need a backup refresh
    if ($w("#bookingDataset")) {
        $w("#bookingDataset").onReady(() => {
            console.log("Dataset ready");
        });
    }
});
