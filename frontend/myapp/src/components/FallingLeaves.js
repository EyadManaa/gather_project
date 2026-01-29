import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { FaLeaf } from 'react-icons/fa';

const FallingLeaves = () => {
    // Generate a consistent set of leaves once
    const leaves = useMemo(() => Array.from({ length: 20 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: Math.random() * 5,
        duration: 5 + Math.random() * 10,
        size: 10 + Math.random() * 20,
        rotation: Math.random() * 360
    })), []);

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: -1,
            overflow: 'hidden'
        }}>
            {leaves.map((leaf) => (
                <motion.div
                    key={leaf.id}
                    initial={{ y: -50, x: 0, opacity: 0, rotate: leaf.rotation }}
                    animate={{
                        y: typeof window !== 'undefined' ? window.innerHeight + 100 : 1000,
                        x: [0, 50, -50, 0], // Drift effect
                        opacity: [0, 1, 1, 0],
                        rotate: leaf.rotation + 360
                    }}
                    transition={{
                        duration: leaf.duration,
                        repeat: Infinity,
                        delay: leaf.delay,
                        ease: 'linear'
                    }}
                    style={{
                        position: 'absolute',
                        left: leaf.left,
                        fontSize: `${leaf.size}px`,
                        color: 'rgba(16, 185, 129, 0.4)' // Semi-transparent Emerald Green
                    }}
                >
                    <FaLeaf />
                </motion.div>
            ))}
        </div>
    );
};

export default React.memo(FallingLeaves);
