// EditSessionDialog.tsx
import { useState } from 'react';
import { Pencil, MapPin, MessageSquare, Palette } from 'lucide-react';
import { Calendar as CalendarIcon, Trash2 } from 'lucide-react';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
    DialogFooter, DialogDescription, DialogTrigger,
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { type ScheduleSession, type ScheduleOverrides, DAYS } from '../../types/Schedule';
import type { CourseCard } from '../../components/CourseCard';

export { EditSessionDialog, CourseCard };