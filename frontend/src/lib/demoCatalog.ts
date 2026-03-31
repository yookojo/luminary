export interface DemoAnimation {
  title: string
  summary: string
  keyPoints: string[]
  videoUrl: string
  demoGroupId: string
}

export interface DemoHistoryItem {
  demoGroupId?: string
}

interface DemoAnimationClip {
  title: string
  summary: string
  keyPoints: string[]
  videoUrl: string
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

const DEMO_ANIMATION_GROUPS: readonly DemoAnimationGroup[] = [
  {
    groupId: 'matrix_intro',
    keywords: [
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
      },
    ],
  },
  {
    groupId: 'matrix_addition',
    keywords: ['matrix addition', 'add matrix', 'add matrices', 'corresponding', 'sum', 'plus'],
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
      },
    ],
  },
  {
    groupId: 'scalar_multiplication',
    keywords: ['scalar', 'vector', 'scale', 'scaled', 'magnitude', 'direction', 'stretch', 'shrink'],
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
      },
    ],
  },
]

function normalizeText(input: string) {
  return input.trim().toLowerCase()
}

function findDemoGroup(input: string) {
  const text = normalizeText(input)

  return DEMO_ANIMATION_GROUPS.find((group) =>
    group.keywords.some((keyword) => text.includes(keyword)),
  ) ?? null
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
