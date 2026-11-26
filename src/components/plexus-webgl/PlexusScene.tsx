'use client';
import { Canvas, useFrame } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { getHeroPatternAdapter } from './hero-pattern-adapters';
import { ConnectionLines } from './ConnectionLines';
import { ParticleField } from './ParticleField';
import { PostProcessing } from './PostProcessing';
import { usePlexusTheme } from './PlexusTheme';