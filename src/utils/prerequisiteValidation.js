// src/utils/prerequisiteValidation.js

// TASK 1 — Check if all selected prerequisites exist
function validatePrerequisitesExist(selectedCourseCodes, allCourses) {
  const existingCodes = allCourses.map((c) => c.courseCode);
  const missing = selectedCourseCodes.filter(
    (code) => !existingCodes.includes(code)
  );
  if (missing.length > 0) return { valid: false, missing };
  return { valid: true };
}

// TASK 2 — Check for circular dependencies
function hasCircularDependency(courseCode, selectedPrerequisites, allCourses) {
  const courseMap = {};
  allCourses.forEach((c) => {
    courseMap[c.courseCode] = c.prerequisites || [];
  });

  for (const prereq of selectedPrerequisites) {
    const visited = new Set();
    const stack = [prereq];

    while (stack.length > 0) {
      const current = stack.pop();
      if (current === courseCode) return true;
      if (visited.has(current)) continue;
      visited.add(current);
      stack.push(...(courseMap[current] || []));
    }
  }
  return false;
}

// TASK 3 — Combined validator
export function validatePrerequisites(courseCode, selectedCourseCodes, allCourses) {
  if (!selectedCourseCodes || selectedCourseCodes.length === 0) {
    return { valid: true };
  }

  const existenceResult = validatePrerequisitesExist(selectedCourseCodes, allCourses);
  if (!existenceResult.valid) {
    return {
      valid: false,
      error: `The following prerequisites do not exist: ${existenceResult.missing.join(", ")}`,
    };
  }

  const isCircular = hasCircularDependency(courseCode, selectedCourseCodes, allCourses);
  if (isCircular) {
    return {
      valid: false,
      error: `Adding ${selectedCourseCodes.join(", ")} would create a circular dependency.`,
    };
  }

  return { valid: true };
}