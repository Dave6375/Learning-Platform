'use client';

import { MotionConfig, motion } from 'motion/react';
import {
    type CSSProperties,
    lazy,
    Suspense,
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
import {PlexusAdapter} from "@/components/ui/plexus-background";
import {useTextScramble} from "@/components/ui/text-scramble";
import { type Local, useTranslation } from '@/lib/trilingual';
