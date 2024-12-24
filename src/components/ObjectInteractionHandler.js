class ObjectInteractionHandler {
    // Handle object click event
    handleObjectClick(object) {
        object.traverse((node) => {
            if (node.isMesh) {
                // Check if the morph target dictionary exists and contains the shape key "hit"
                const hitIndex = node.morphTargetDictionary["hit"];
                if (hitIndex !== undefined) {
                    // Set the influence of the "hit" shape key to 1 (0 none, 1 full)
                    node.morphTargetInfluences[hitIndex] = 1;
                }
            }
        });
    }
}

export default ObjectInteractionHandler;