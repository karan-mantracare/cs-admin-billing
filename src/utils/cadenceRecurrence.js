import { RRule } from 'rrule';

/**
 * Standard IANA timezones commonly used in MantraCare corporate accounts.
 */
export const POPULAR_TIMEZONES = [
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST +05:30)', city: 'India - Delhi, Mumbai, Bengaluru' },
  { value: 'America/New_York', label: 'America/New_York (EST/EDT -05:00/-04:00)', city: 'US Eastern - New York, Atlanta' },
  { value: 'America/Chicago', label: 'America/Chicago (CST/CDT -06:00/-05:00)', city: 'US Central - Chicago, Dallas' },
  { value: 'America/Denver', label: 'America/Denver (MST/MDT -07:00/-06:00)', city: 'US Mountain - Denver, Phoenix' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (PST/PDT -08:00/-07:00)', city: 'US Pacific - Los Angeles, San Francisco' },
  { value: 'Europe/London', label: 'Europe/London (GMT/BST +00:00/+01:00)', city: 'UK - London' },
  { value: 'Europe/Paris', label: 'Europe/Paris (CET/CEST +01:00/+02:00)', city: 'Europe - Paris, Berlin, Amsterdam' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai (GST +04:00)', city: 'UAE - Dubai, Abu Dhabi' },
  { value: 'Asia/Singapore', label: 'Asia/Singapore (SGT +08:00)', city: 'Singapore' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST +09:00)', city: 'Japan - Tokyo' },
  { value: 'Australia/Sydney', label: 'Australia/Sydney (AEST/AEDT +10:00/+11:00)', city: 'Australia - Sydney, Melbourne' },
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)', city: 'Universal Time' }
];

export const DAYS_OF_WEEK = [
  { code: 'MO', label: 'Monday', short: 'Mon', rruleDay: RRule.MO },
  { code: 'TU', label: 'Tuesday', short: 'Tue', rruleDay: RRule.TU },
  { code: 'WE', label: 'Wednesday', short: 'Wed', rruleDay: RRule.WE },
  { code: 'TH', label: 'Thursday', short: 'Thu', rruleDay: RRule.TH },
  { code: 'FR', label: 'Friday', short: 'Fri', rruleDay: RRule.FR },
  { code: 'SA', label: 'Saturday', short: 'Sat', rruleDay: RRule.SA },
  { code: 'SU', label: 'Sunday', short: 'Sun', rruleDay: RRule.SU }
];

export const MONTHLY_ORDINALS = [
  { value: '1', label: 'First', rruleNth: 1 },
  { value: '2', label: 'Second', rruleNth: 2 },
  { value: '3', label: 'Third', rruleNth: 3 },
  { value: '4', label: 'Fourth', rruleNth: 4 },
  { value: '-1', label: 'Last', rruleNth: -1 }
];

export const WEEKDAYS_ONLY = [
  { code: 'MO', label: 'Monday', rruleDay: RRule.MO },
  { code: 'TU', label: 'Tuesday', rruleDay: RRule.TU },
  { code: 'WE', label: 'Wednesday', rruleDay: RRule.WE },
  { code: 'TH', label: 'Thursday', rruleDay: RRule.TH },
  { code: 'FR', label: 'Friday', rruleDay: RRule.FR }
];

/**
 * Converts a date string (YYYY-MM-DD) and time string (HH:mm or HH:mm:ss) in a given IANA timezone
 * to an exact JavaScript Date object (representing the UTC epoch timestamp).
 */
export function localToUtc(dateStr, timeStr, timeZone) {
  if (!dateStr || !timeStr) return null;
  const [y, m, d] = dateStr.split('-').map(Number);
  const timeParts = timeStr.split(':').map(Number);
  const hh = timeParts[0] || 0;
  const mm = timeParts[1] || 0;
  const ss = timeParts[2] || 0;

  // Initial UTC guess
  const approx = new Date(Date.UTC(y, m - 1, d, hh, mm, ss));
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false
  });

  const getParts = (date) => {
    const parts = formatter.formatToParts(date);
    const p = {};
    for (const part of parts) {
      if (part.type !== 'literal') p[part.type] = Number(part.value);
    }
    if (p.hour === 24) p.hour = 0;
    return p;
  };

  let target = approx;
  for (let i = 0; i < 4; i++) {
    const p = getParts(target);
    const asLocal = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second || 0);
    const desiredLocal = Date.UTC(y, m - 1, d, hh, mm, ss);
    const diff = desiredLocal - asLocal;
    if (diff === 0) break;
    target = new Date(target.getTime() + diff);
  }
  return target;
}

/**
 * Converts a UTC Date object to local YYYY-MM-DD and HH:mm in a specific IANA timezone.
 */
export function utcToLocalParts(utcDate, timeZone) {
  if (!utcDate) return { dateStr: '', timeStr: '', fullStr: '' };
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  const parts = formatter.formatToParts(utcDate);
  const p = {};
  for (const part of parts) {
    if (part.type !== 'literal') p[part.type] = part.value;
  }
  const dateStr = `${p.year}-${p.month}-${p.day}`;
  const timeStr = `${p.hour}:${p.minute}`;
  return { dateStr, timeStr, fullStr: `${dateStr}T${timeStr}` };
}

/**
 * Formats a local date end-of-day into UTC format YYYYMMDDTHHmmssZ for RRULE UNTIL clause.
 */
export function formatUntilUtc(endDateStr, timeZone) {
  if (!endDateStr) return null;
  // End of local date is 23:59:59 in the target timezone
  const endOfDayUtc = localToUtc(endDateStr, '23:59:59', timeZone);
  if (!endOfDayUtc) return null;
  const iso = endOfDayUtc.toISOString();
  return iso.replace(/[-:]/g, '').split('.')[0] + 'Z';
}

/**
 * Builds RFC 5545 RRULE string conforming to all user criteria.
 */
export function buildRRuleString({
  frequency,
  selectedDays,
  monthlyMode,
  monthlyWeekday,
  monthlyOrdinal,
  monthlyDate,
  endMode,
  endDate,
  occurrenceCount,
  timeZone
}) {
  if (frequency === 'One time') {
    return null;
  }

  let ruleBody = '';

  if (frequency === 'Daily' || frequency === 'Weekly') {
    // Generate weekly RRULE with BYDAY
    const days = selectedDays && selectedDays.length > 0 ? selectedDays.join(',') : 'MO,TU,WE,TH,FR';
    ruleBody = `FREQ=WEEKLY;BYDAY=${days}`;
  } else if (frequency === 'Monthly') {
    if (monthlyMode === 'weekday') {
      // e.g. 2MO or -1FR (normalize without positive sign for clean standard output: 2MO)
      const ord = monthlyOrdinal === '1' ? '1' : monthlyOrdinal;
      ruleBody = `FREQ=MONTHLY;BYDAY=${ord}${monthlyWeekday}`;
    } else {
      // By date (1-31)
      const dayNum = parseInt(monthlyDate, 10) || 1;
      ruleBody = `FREQ=MONTHLY;BYMONTHDAY=${dayNum}`;
    }
  }

  // Handle Recurrence Ending
  if (endMode === 'on_date' && endDate) {
    const until = formatUntilUtc(endDate, timeZone);
    if (until) {
      ruleBody += `;UNTIL=${until}`;
    }
  } else if (endMode === 'count' && occurrenceCount) {
    const count = Math.max(1, parseInt(occurrenceCount, 10) || 1);
    ruleBody += `;COUNT=${count}`;
  }
  // Never combine COUNT and UNTIL. If endMode is 'never', neither is added.

  return `RRULE:${ruleBody}`;
}

/**
 * Computes the first occurrence and next N occurrences given the parameters.
 */
export function computeOccurrences({
  startDate,
  startTime,
  timeZone = 'Asia/Kolkata',
  durationMinutes = 30,
  frequency,
  selectedDays = ['MO', 'TU', 'WE', 'TH', 'FR'],
  monthlyMode = 'weekday',
  monthlyWeekday = 'FR',
  monthlyOrdinal = '-1',
  monthlyDate = 15,
  endMode = 'never',
  endDate = '',
  occurrenceCount = 6,
  maxResults = 5
}) {
  if (!startDate || !startTime) {
    return {
      firstOccurrence: null,
      occurrences: [],
      error: 'Start date and start time are required.'
    };
  }

  try {
    if (frequency === 'One time') {
      const durationMs = (parseInt(durationMinutes, 10) || 30) * 60 * 1000;
      const nowUtc = Date.now();
      const startUtcDate = localToUtc(startDate, startTime, timeZone);
      const endUtcDate = new Date(startUtcDate.getTime() + durationMs);
      const endLocal = utcToLocalParts(endUtcDate, timeZone);

      const occ = {
        index: 1,
        date: startDate,
        startTime: startTime,
        endTime: endLocal.timeStr,
        endDate: endLocal.dateStr,
        crossesMidnight: endLocal.dateStr !== startDate,
        startUtc: startUtcDate.toISOString(),
        endUtc: endUtcDate.toISOString(),
        startDateTime: `${startDate}T${startTime}:00`,
        endDateTime: `${endLocal.dateStr}T${endLocal.timeStr}:00`,
        displayDate: new Date(`${startDate}T12:00:00Z`).toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })
      };

      const firstStartEpoch = startUtcDate.getTime();
      const isPast = firstStartEpoch < nowUtc - 60000;

      return {
        firstOccurrence: occ,
        occurrences: [occ],
        isPast,
        totalCount: 1,
        error: isPast ? 'The selected date/time is in the past. Please select a future date and time.' : null
      };
    }

    const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
    const [startHour, startMin] = startTime.split(':').map(Number);

    // Build rrule options for local representation
    let freqOption;
    let byweekdayOption = null;
    let bymonthdayOption = null;

    if (frequency === 'Daily' || frequency === 'Weekly') {
      freqOption = RRule.WEEKLY;
      const dayMap = {
        MO: RRule.MO,
        TU: RRule.TU,
        WE: RRule.WE,
        TH: RRule.TH,
        FR: RRule.FR,
        SA: RRule.SA,
        SU: RRule.SU
      };
      byweekdayOption = (selectedDays || []).map(code => dayMap[code]).filter(Boolean);
      if (byweekdayOption.length === 0) {
        return {
          firstOccurrence: null,
          occurrences: [],
          error: 'Please select at least one day for weekly/daily cadence.'
        };
      }
    } else if (frequency === 'Monthly') {
      freqOption = RRule.MONTHLY;
      if (monthlyMode === 'weekday') {
        const dayMap = {
          MO: RRule.MO,
          TU: RRule.TU,
          WE: RRule.WE,
          TH: RRule.TH,
          FR: RRule.FR
        };
        const nth = parseInt(monthlyOrdinal, 10) || 1;
        const day = dayMap[monthlyWeekday] || RRule.FR;
        byweekdayOption = [day.nth(nth)];
      } else {
        const dayNum = parseInt(monthlyDate, 10) || 1;
        bymonthdayOption = [dayNum];
      }
    }

    // Reference dtstart representing local clock time (year, month, day, hour, min in UTC envelope)
    const dtstart = new Date(Date.UTC(startYear, startMonth - 1, startDay, startHour, startMin, 0));

    const ruleConfig = {
      freq: freqOption,
      dtstart,
      interval: 1
    };

    if (byweekdayOption) ruleConfig.byweekday = byweekdayOption;
    if (bymonthdayOption) ruleConfig.bymonthday = bymonthdayOption;

    if (endMode === 'count' && occurrenceCount) {
      ruleConfig.count = Math.max(1, parseInt(occurrenceCount, 10) || 1);
    } else if (endMode === 'on_date' && endDate) {
      const [ey, em, ed] = endDate.split('-').map(Number);
      ruleConfig.until = new Date(Date.UTC(ey, em - 1, ed, 23, 59, 59));
    }

    const rule = new RRule(ruleConfig);

    // Compute occurrences matching the rule
    // We want all occurrences on or after startDate at startTime
    const searchLimit = 60; // Max occurrences to inspect
    let allMatches = [];
    try {
      allMatches = rule.all((_, i) => i < searchLimit);
    } catch (e) {
      allMatches = [];
    }

    if (allMatches.length === 0) {
      return {
        firstOccurrence: null,
        occurrences: [],
        error: 'No valid occurrences found within the selected date range.'
      };
    }

    const durationMs = (parseInt(durationMinutes, 10) || 30) * 60 * 1000;
    const nowUtc = Date.now();

    // Map matches to real timezone-aware occurrences
    const occurrences = allMatches.slice(0, maxResults).map((d, index) => {
      const localDateStr = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
      const localTimeStr = `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;

      // Convert local date + time in target timezone to true UTC
      const startUtcDate = localToUtc(localDateStr, localTimeStr, timeZone);
      const endUtcDate = new Date(startUtcDate.getTime() + durationMs);

      // Local parts of end time (which can cross midnight)
      const endLocal = utcToLocalParts(endUtcDate, timeZone);

      return {
        index: index + 1,
        date: localDateStr,
        startTime: localTimeStr,
        endTime: endLocal.timeStr,
        endDate: endLocal.dateStr,
        crossesMidnight: endLocal.dateStr !== localDateStr,
        startUtc: startUtcDate.toISOString(),
        endUtc: endUtcDate.toISOString(),
        startDateTime: `${localDateStr}T${localTimeStr}:00`,
        endDateTime: `${endLocal.dateStr}T${endLocal.timeStr}:00`,
        displayDate: new Date(`${localDateStr}T12:00:00Z`).toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })
      };
    });

    const firstOccurrence = occurrences[0] || null;

    // Check if first occurrence is in the past
    let isPast = false;
    if (firstOccurrence) {
      const firstStartEpoch = new Date(firstOccurrence.startUtc).getTime();
      // Allow a small 60-second grace window for form submission
      if (firstStartEpoch < nowUtc - 60000) {
        isPast = true;
      }
    }

    return {
      firstOccurrence,
      occurrences,
      isPast,
      totalCount: allMatches.length,
      error: isPast ? 'The first occurrence is in the past. Please select a future start date or start time.' : null
    };
  } catch (err) {
    return {
      firstOccurrence: null,
      occurrences: [],
      error: `Failed to calculate recurrence occurrences: ${err.message}`
    };
  }
}

/**
 * Builds a clear, human-readable cadence recurrence summary.
 */
export function getHumanReadableSummary({
  frequency,
  selectedDays,
  monthlyMode,
  monthlyWeekday,
  monthlyOrdinal,
  monthlyDate,
  startDate = '',
  startTime,
  timeZone,
  durationMinutes,
  endMode,
  endDate,
  occurrenceCount
}) {
  const dayNameMap = {
    MO: 'Monday',
    TU: 'Tuesday',
    WE: 'Wednesday',
    TH: 'Thursday',
    FR: 'Friday',
    SA: 'Saturday',
    SU: 'Sunday'
  };

  const ordinalMap = {
    '1': 'first',
    '2': 'second',
    '3': 'third',
    '4': 'fourth',
    '-1': 'last'
  };

  if (frequency === 'One time') {
    const tzShort = timeZone ? timeZone.split('/').pop().replace(/_/g, ' ') : 'IST';
    let dateStr = startDate || 'selected date';
    try {
      if (startDate) {
        dateStr = new Date(`${startDate}T12:00:00Z`).toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
      }
    } catch (e) {
      dateStr = startDate;
    }
    return `One-time meeting on ${dateStr} at ${startTime || '11:00'} (${tzShort}, ${durationMinutes || 30} mins)`;
  }

  let freqText = '';
  if (frequency === 'Daily') {
    if (selectedDays && selectedDays.length === 5 && !selectedDays.includes('SA') && !selectedDays.includes('SU')) {
      freqText = 'Every weekday (Monday to Friday)';
    } else if (selectedDays && selectedDays.length === 7) {
      freqText = 'Every day (Monday to Sunday)';
    } else {
      const dayNames = (selectedDays || []).map(c => dayNameMap[c] || c).join(', ');
      freqText = `Daily on ${dayNames || 'selected days'}`;
    }
  } else if (frequency === 'Weekly') {
    const dayNames = (selectedDays || []).map(c => dayNameMap[c] || c).join(', ');
    freqText = `Weekly on ${dayNames || 'selected days'}`;
  } else if (frequency === 'Monthly') {
    if (monthlyMode === 'weekday') {
      const ord = ordinalMap[monthlyOrdinal] || 'first';
      const day = dayNameMap[monthlyWeekday] || 'Friday';
      freqText = `Monthly on the ${ord} ${day}`;
    } else {
      freqText = `Monthly on day ${monthlyDate || 1}`;
    }
  }

  let endText = '';
  if (endMode === 'never') {
    endText = 'No end date';
  } else if (endMode === 'on_date' && endDate) {
    endText = `until ${endDate}`;
  } else if (endMode === 'count' && occurrenceCount) {
    endText = `for ${occurrenceCount} occurrences`;
  }

  const tzShort = timeZone ? timeZone.split('/').pop().replace(/_/g, ' ') : 'IST';
  return `${freqText} at ${startTime || '11:00'} (${tzShort}, ${durationMinutes} mins) • ${endText}`;
}
