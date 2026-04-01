export interface DemoAnimation {
  title: string
  summary: string
  keyPoints: string[]
  videoUrl: string
  demoGroupId: string
}

export interface DemoLibraryTopic {
  id: string
  title: string
  summary: string
  keyPoints: string[]
  videoUrl: string
  demoGroupId?: string
  featured?: boolean
}

export interface DemoHistoryItem {
  demoGroupId?: string
}

interface DemoAnimationClip {
  title: string
  summary: string
  keyPoints: string[]
  videoUrl: string
  featured?: boolean
}

interface DemoAnimationGroup {
  groupId: string
  keywords: readonly string[]
  clips: readonly DemoAnimationClip[]
}

export const STATIC_DEMO_PROMPTS = [
  '2x2 matrices',
  'matrix addition',
  'scalar multiplication',
] as const

export type StaticDemoPrompt = typeof STATIC_DEMO_PROMPTS[number]

const SUPPORTED_DEMO_PROMPT_SUGGESTIONS: ReadonlyArray<{
  prompt: StaticDemoPrompt
  keywords: readonly string[]
}> = [
  {
    prompt: '2x2 matrices',
    keywords: [
      'matrix',
      'matrices',
      '2x2',
      '2 x 2',
      'row',
      'rows',
      'column',
      'columns',
      'grid',
      'determinant',
      'determinants',
      'eigenvalue',
      'eigenvalues',
      'eigenvector',
      'eigenvectors',
    ],
  },
  {
    prompt: 'matrix addition',
    keywords: ['add', 'addition', 'plus', 'sum', 'corresponding', 'combine'],
  },
  {
    prompt: 'scalar multiplication',
    keywords: ['scalar', 'vector', 'scale', 'scaled', 'stretch', 'shrink', 'magnitude'],
  },
]

const DEMO_ANIMATION_GROUPS: readonly DemoAnimationGroup[] = [
  {
    groupId: 'matrix_intro',
    keywords: [
      '2x2 matrices',
      '2x2 matrix',
      'matrix',
      'matrices',
      '2x2',
      '2 x 2',
      'rows',
      'columns',
      'grid',
      'matrix theory',
      'linear algebra',
      'eigenvalue',
      'eigenvalues',
      'determinant',
      'determinants',
      'eigenvector',
      'eigenvectors',
    ],
    clips: [
      {
        title: 'Introduction to 2x2 matrices',
        summary: 'A 2x2 matrix is introduced, showing its rows, columns, and the matrix as a whole.',
        keyPoints: [
          'Introduction to 2x2 matrices',
          'Identifying rows and columns',
          'Matrix as a single unit',
        ],
        videoUrl: '/demo-media/matrix-intro-1.mp4',
        featured: true,
      },
      {
        title: 'Matrix organization',
        summary: 'Matrices organize information into rows and columns so structure becomes easy to see.',
        keyPoints: [
          'Rows collect horizontal entries',
          'Columns collect vertical entries',
          'Structure makes patterns easier to spot',
        ],
        videoUrl: '/demo-media/matrix-intro-2.mp4',
        featured: true,
      },
      {
        title: 'Rectangular matrix arrays',
        summary: 'A matrix can be seen as a rectangular array that stores information in a clean visual layout.',
        keyPoints: [
          'A matrix is a rectangular array',
          'Shape matters in matrix notation',
          'Layout supports comparison and computation',
        ],
        videoUrl: '/demo-media/matrix-intro-3.mp4',
        featured: true,
      },
      {
        title: 'Matrix continuation',
        summary: 'The idea of a matrix is reinforced by showing how entries, rows, and columns work together as one object.',
        keyPoints: [
          'Entries belong to a larger structure',
          'Rows and columns define position',
          'The whole matrix is a single mathematical object',
        ],
        videoUrl: '/demo-media/matrix-intro-4.mp4',
        featured: true,
      },
    ],
  },
  {
    groupId: 'matrix_addition',
    keywords: ['matrix addition', 'add matrix', 'add matrices', 'corresponding entries', 'corresponding', 'sum', 'plus'],
    clips: [
      {
        title: 'Matrix addition',
        summary: 'Learn how to add matrices by adding corresponding elements. Matrices must have the same dimensions.',
        keyPoints: [
          'Add elements in the same position',
          'Matrices must have identical dimensions',
          'The result keeps the same shape',
        ],
        videoUrl: '/demo-media/matrix-addition-1.mp4',
        featured: true,
      },
      {
        title: 'Matrix addition continuation',
        summary: 'Matrix addition is reinforced by walking through another aligned element-by-element example.',
        keyPoints: [
          'Match entries by position',
          'Add carefully across both matrices',
          'The final matrix keeps the same dimensions',
        ],
        videoUrl: '/demo-media/matrix-addition-2.mp4',
        featured: true,
      },
    ],
  },
  {
    groupId: 'scalar_multiplication',
    keywords: ['scalar multiplication', 'scalar', 'vector', 'scale', 'scaled', 'magnitude', 'direction', 'stretch', 'shrink'],
    clips: [
      {
        title: 'Scalar multiplication',
        summary: 'Multiplying a vector by a scalar changes its length and sometimes its direction.',
        keyPoints: [
          'Scalars change vector magnitude',
          'Positive scalars keep direction',
          'Negative scalars reverse direction',
        ],
        videoUrl: '/demo-media/scalar-multiplication-1.mp4',
        featured: true,
      },
      {
        title: 'Scalar multiplication with vectors',
        summary: 'The effect of scalar multiplication becomes clearer when the original and scaled vectors are shown together.',
        keyPoints: [
          'Compare original and scaled vectors',
          'Direction matters as much as length',
          'Visual contrast makes scaling intuitive',
        ],
        videoUrl: '/demo-media/scalar-multiplication-2.mp4',
        featured: true,
      },
      {
        title: 'Vector scaling',
        summary: 'Scaling shows how a vector can stretch outward or shrink inward while preserving its line of action.',
        keyPoints: [
          'Scaling preserves the vector line',
          'Larger scalars stretch farther',
          'Smaller scalars shrink the vector',
        ],
        videoUrl: '/demo-media/scalar-multiplication-3.mp4',
        featured: true,
      },
      {
        title: 'Vector magnitude',
        summary: 'Vector magnitude helps connect scalar multiplication to the idea of length on the coordinate plane.',
        keyPoints: [
          'Magnitude measures vector length',
          'Scaling changes that length',
          'Visual length builds intuition quickly',
        ],
        videoUrl: '/demo-media/scalar-multiplication-4.mp4',
        featured: true,
      },
    ],
  },
]

const EXTRA_DEMO_LIBRARY_TOPICS: readonly DemoLibraryTopic[] = [
  {
    id: 'concept_overview',
    title: 'Concept overview',
    summary: 'A broad conceptual visual designed to introduce a topic before going deeper into structure and process.',
    keyPoints: [
      'Big-picture intuition first',
      'Visual framing before details',
      'Strong opening demo clip',
    ],
    videoUrl: '/demo-media/concept-overview.mp4',
    featured: true,
  },
  {
    id: 'matrix_intro_overview',
    title: 'Matrix introduction overview',
    summary: 'A clean introductory matrix visual that reinforces what a matrix looks like before focusing on its parts.',
    keyPoints: [
      'Foundational matrix picture',
      'Entries arranged in a grid',
      'Good first-pass intuition',
    ],
    videoUrl: '/demo-media/matrix-intro.mp4',
  },
  {
    id: 'matrix_addition_overview',
    title: 'Matrix addition overview',
    summary: 'A broader matrix addition clip that complements the step-by-step element matching visuals.',
    keyPoints: [
      'Addition at a glance',
      'Aligned entries matter',
      'Result keeps the same dimensions',
    ],
    videoUrl: '/demo-media/matrix-addition.mp4',
  },
  {
    id: 'scalar_multiplication_overview',
    title: 'Scalar multiplication overview',
    summary: 'A compact scalar multiplication visual that pairs well with the more detailed vector-scaling clips.',
    keyPoints: [
      'Scaling changes length',
      'Direction can reverse',
      'Useful warm-up visual',
    ],
    videoUrl: '/demo-media/scalar-multiplication.mp4',
  },
  {
    id: 'matrix_intro_alt',
    title: 'Alternative 2x2 matrix intro',
    summary: 'A second introductory view of a 2x2 matrix that helps vary the pacing of the guided demo.',
    keyPoints: [
      'Alternative matrix framing',
      'Good replay option',
      'Supports continued explanation',
    ],
    videoUrl: '/demo-media/matrix-intro-alt.mp4',
  },
  {
    id: 'matrix_foundations_extra',
    title: 'Matrix foundations',
    summary: 'A deeper foundational matrix clip that reinforces how entries, rows, and columns relate inside one structure.',
    keyPoints: [
      'Foundations before operations',
      'Position matters',
      'Structure supports computation',
    ],
    videoUrl: '/demo-media/matrix-foundations-extra.mp4',
  },
  {
    id: 'matrix_continuation_extra',
    title: 'Matrix continuation',
    summary: 'A follow-on matrix visual that works well after the student already understands the basic layout.',
    keyPoints: [
      'Builds on the first matrix idea',
      'Keeps the visual story going',
      'Good continuation clip',
    ],
    videoUrl: '/demo-media/matrix-continuation-extra.mp4',
  },
  {
    id: 'solar_system',
    title: 'Solar system overview',
    summary: 'A space-focused demo visual that shows orbital structure and motion across the solar system.',
    keyPoints: [
      'Planetary motion',
      'Orbital intuition',
      'Memorable space visual',
    ],
    videoUrl: '/demo-media/solar-system.mp4',
    featured: true,
  },
  {
    id: 'vector_addition_1',
    title: 'Vector addition',
    summary: 'A vector addition clip that shows how two vectors combine into a single result.',
    keyPoints: [
      'Add vectors tip-to-tail',
      'Visualize the result vector',
      'Direction and length both matter',
    ],
    videoUrl: '/demo-media/vector-addition-1.mp4',
    featured: true,
  },
  {
    id: 'vector_addition_2',
    title: 'Vector addition continuation',
    summary: 'A continuation clip for vector addition that reinforces how component changes affect the final vector.',
    keyPoints: [
      'Continuation of vector addition',
      'Compare component changes',
      'Strengthens geometric intuition',
    ],
    videoUrl: '/demo-media/vector-addition-2.mp4',
  },
  {
    id: 'combinatorics',
    title: 'Combinatorics overview',
    summary: 'A combinatorics visual that highlights counting structure and the logic of arranging possibilities.',
    keyPoints: [
      'Counting with structure',
      'Patterns in possibilities',
      'Good discrete-math demo',
    ],
    videoUrl: '/demo-media/combinatorics.mp4',
  },
  {
    id: 'genealogy_family_trees',
    title: 'Genealogy family trees',
    summary: 'A family-tree style visual that helps explain branching structure and relationships over time.',
    keyPoints: [
      'Branching relationships',
      'Tree structure intuition',
      'Useful network-style visual',
    ],
    videoUrl: '/demo-media/genealogy-family-trees.mp4',
  },
  {
    id: 'markov_chain',
    title: 'Markov chain intuition',
    summary: 'A Markov chain animation that shows how states transition over time with weighted movement.',
    keyPoints: [
      'States and transitions',
      'Probabilistic movement',
      'Excellent process visual',
    ],
    videoUrl: '/demo-media/markov-chain.mp4',
    featured: true,
  },
  {
    id: 'expanding_circle',
    title: 'Expanding circle',
    summary: 'A simple growth animation that works well as a visual metaphor for scaling or expansion over time.',
    keyPoints: [
      'Expansion over time',
      'Strong visual metaphor',
      'Useful supporting clip',
    ],
    videoUrl: '/demo-media/expanding-circle.mp4',
  },
  {
    id: 'permutations_three_fruits',
    title: 'Permutations with three fruits',
    summary: 'A discrete-math clip that makes permutations concrete by rearranging a small set of familiar objects.',
    keyPoints: [
      'Permutations made tangible',
      'Order matters',
      'Friendly combinatorics example',
    ],
    videoUrl: '/demo-media/permutations-three-fruits.mp4',
  },
]

function normalizeText(input: string) {
  return input.trim().toLowerCase()
}

function findDemoGroup(input: string) {
  const text = normalizeText(input)
  let bestMatch: { group: DemoAnimationGroup; score: number } | null = null

  for (const group of DEMO_ANIMATION_GROUPS) {
    for (const rawKeyword of group.keywords) {
      const keyword = normalizeText(rawKeyword)
      if (!text.includes(keyword)) {
        continue
      }

      let score = keyword.length
      if (text === keyword) {
        score += 1000
      } else if (text.startsWith(keyword)) {
        score += 250
      }

      if (!bestMatch || score > bestMatch.score) {
        bestMatch = { group, score }
      }
    }
  }

  return bestMatch?.group ?? null
}

export function selectDemoAnimation(
  input: string,
  history: readonly DemoHistoryItem[],
): DemoAnimation | null {
  const group = findDemoGroup(input)
  if (!group) {
    return null
  }

  const usedCount = history.filter((item) => item.demoGroupId === group.groupId).length
  const clip = group.clips[Math.min(usedCount, group.clips.length - 1)]

  return {
    ...clip,
    demoGroupId: group.groupId,
  }
}

export function suggestDemoPrompt(input: string): StaticDemoPrompt {
  const text = normalizeText(input)
  let bestPrompt: StaticDemoPrompt = STATIC_DEMO_PROMPTS[0]
  let bestScore = -1

  for (const suggestion of SUPPORTED_DEMO_PROMPT_SUGGESTIONS) {
    let score = 0

    for (const rawKeyword of suggestion.keywords) {
      const keyword = normalizeText(rawKeyword)
      if (text.includes(keyword)) {
        score += keyword.length
      }
    }

    if (score > bestScore) {
      bestScore = score
      bestPrompt = suggestion.prompt
    }
  }

  return bestPrompt
}

export function getDemoLibraryTopics(): DemoLibraryTopic[] {
  const groupedTopics = DEMO_ANIMATION_GROUPS.flatMap((group) =>
    group.clips.map((clip, index) => ({
      id: `${group.groupId}_${index + 1}`,
      title: clip.title,
      summary: clip.summary,
      keyPoints: clip.keyPoints,
      videoUrl: clip.videoUrl,
      demoGroupId: group.groupId,
      featured: clip.featured ?? false,
    })),
  )

  return [...groupedTopics, ...EXTRA_DEMO_LIBRARY_TOPICS]
}
