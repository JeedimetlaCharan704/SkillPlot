const RoadmapService = (function () {
  const ROADMAP_TEMPLATES = {
    '30': {
      label: '30 Day Plan',
      icon: 'fa-bolt',
      color: 'var(--success)',
      description: 'Quick start — build foundational knowledge'
    },
    '60': {
      label: '60 Day Plan',
      icon: 'fa-rocket',
      color: 'var(--primary)',
      description: 'Deep dive — build practical projects'
    },
    '90': {
      label: '90 Day Plan',
      icon: 'fa-trophy',
      color: 'var(--accent)',
      description: 'Mastery — become job-ready'
    }
  }

  function _getSkillBasedTasks (skillName, dayOffset, totalDays) {
    const phase = dayOffset / totalDays
    const tasks = []

    if (phase < 0.33) {
      tasks.push({ type: 'learn', description: `Learn fundamentals of ${skillName}` })
      tasks.push({ type: 'practice', description: `Complete beginner exercises in ${skillName}` })
    } else if (phase < 0.66) {
      tasks.push({ type: 'build', description: `Build a project using ${skillName}` })
      tasks.push({ type: 'practice', description: `Solve intermediate problems in ${skillName}` })
    } else {
      tasks.push({ type: 'advanced', description: `Master advanced ${skillName} concepts` })
      tasks.push({ type: 'portfolio', description: `Add ${skillName} project to portfolio` })
    }

    return tasks
  }

  async function generate (targetRoleId, duration = '30') {
    await new Promise(r => setTimeout(r, 500 + Math.random() * 400))

    const careerPaths = window.CareerPaths || []
    const path = careerPaths.find(p => p.id === targetRoleId)

    if (!path) {
      return { error: 'Career path not found' }
    }

    const skillGap = Store.get('skillGapAnalysis')
    const missingSkills = skillGap?.missingSkills || []
    const requiredSkills = path.skills || []

    const totalDays = duration === '30' ? 30 : duration === '60' ? 60 : 90
    const tasksPerDay = 2 + Math.floor(Math.random() * 2)

    const roadmap = []
    for (let day = 1; day <= totalDays; day++) {
      const dayTasks = []

      if (requiredSkills.length > 0) {
        const skillIndex = (day - 1) % requiredSkills.length
        const skill = requiredSkills[skillIndex]
        const skillTasks = _getSkillBasedTasks(skill.name, day, totalDays)
        dayTasks.push(skillTasks[0])
        dayTasks.push(skillTasks[1] || { type: 'review', description: `Review ${skill.name} concepts` })
      }

      if (missingSkills.length > 0 && day % 3 === 0) {
        const missingIdx = Math.floor((day / 3) % missingSkills.length)
        if (missingSkills[missingIdx]) {
          dayTasks.push({
            type: 'gap',
            description: `Learn: ${missingSkills[missingIdx].name} (approx ${missingSkills[missingIdx].estimatedHours || 8}h)`
          })
        }
      }

      if (day % 7 === 0 && path.roadmaps && path.roadmaps[duration]) {
        const weeklyTasks = path.roadmaps[duration]
        const weekIdx = Math.floor(day / 7) - 1
        if (weeklyTasks[weekIdx]) {
          dayTasks.push({ type: 'milestone', description: weeklyTasks[weekIdx] })
        }
      }

      if (dayTasks.length < 2) {
        dayTasks.push({ type: 'practice', description: 'Practice coding problems' })
      }

      roadmap.push({
        day,
        tasks: dayTasks.slice(0, tasksPerDay),
        completed: false
      })
    }

    const skillFocus = requiredSkills.slice(0, 5).map(s => s.name)
    const missingFocus = missingSkills.slice(0, 3).map(s => s.name)

    const suggestions = []
    if (missingFocus.length > 0) {
      suggestions.push(`Prioritize filling gaps in: ${missingFocus.join(', ')}`)
    }
    suggestions.push(`Dedicate ${Math.round(totalDays * 1.5)} hours over ${totalDays} days for this roadmap`)
    suggestions.push('Practice coding problems alongside roadmap tasks')

    const result = {
      role: path.title,
      roleId: path.id,
      duration,
      durationLabel: ROADMAP_TEMPLATES[duration]?.label || `${duration} Day Plan`,
      totalDays,
      totalTasks: roadmap.length * tasksPerDay,
      estimatedHoursPerDay: 1.5,
      roadmap,
      skillFocus,
      missingFocus,
      template: ROADMAP_TEMPLATES[duration],
      confidence: 'High',
      suggestions,
      calculation: {
        steps: [
          `Generated ${totalDays}-day roadmap for ${path.title}`,
          `Focused on ${skillFocus.length} key skills: ${skillFocus.join(', ')}`,
          `Addressing ${missingFocus.length} skill gaps: ${missingFocus.join(', ')}`,
          `Approximately ${Math.round(totalDays * 1.5)} hours total commitment`
        ],
        formula: `roadmap = ${totalDays} days × ${tasksPerDay} tasks/day`
      }
    }

    Store.set('roadmap', result)
    return result
  }

  function getLastRoadmap () {
    return Store.get('roadmap')
  }

  return { generate, getLastRoadmap }
})()
