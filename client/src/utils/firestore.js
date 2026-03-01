import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db, auth } from '../firebase';

// 자녀 관련 Firestore 유틸리티 함수들

/**
 * 사용자의 모든 자녀 목록을 가져오는 함수
 * @returns {Promise<Array>} 자녀 목록 배열
 */
export const getChildren = async () => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('로그인이 필요합니다.');

    // children 서브컬렉션에서 자녀 목록 조회
    const childrenRef = collection(db, 'users', user.uid, 'children');
    const childrenQuery = query(childrenRef, orderBy('createdAt', 'asc'));
    const snapshot = await getDocs(childrenQuery);

    const children = [];
    snapshot.forEach((doc) => {
      children.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return children;
  } catch (error) {
    console.error('자녀 목록 조회 에러:', error);
    throw error;
  }
};

/**
 * 새 자녀를 추가하는 함수
 * @param {Object} childData - 자녀 정보 객체
 * @returns {Promise<string>} 생성된 자녀 ID
 */
export const addChild = async (childData) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('로그인이 필요합니다.');

    // children 서브컬렉션에 새 자녀 추가
    const childrenRef = collection(db, 'users', user.uid, 'children');
    const docRef = await addDoc(childrenRef, {
      ...childData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    console.log('새 자녀 추가 완료:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('자녀 추가 에러:', error);
    throw error;
  }
};

/**
 * 자녀 정보를 업데이트하는 함수
 * @param {string} childId - 자녀 ID
 * @param {Object} updateData - 업데이트할 데이터
 */
export const updateChild = async (childId, updateData) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('로그인이 필요합니다.');

    const childRef = doc(db, 'users', user.uid, 'children', childId);
    await updateDoc(childRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    });

    console.log('자녀 정보 업데이트 완료:', childId);
  } catch (error) {
    console.error('자녀 정보 업데이트 에러:', error);
    throw error;
  }
};

/**
 * 자녀를 삭제하는 함수
 * @param {string} childId - 자녀 ID
 */
export const deleteChild = async (childId) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('로그인이 필요합니다.');

    const childRef = doc(db, 'users', user.uid, 'children', childId);
    await deleteDoc(childRef);

    console.log('자녀 삭제 완료:', childId);
  } catch (error) {
    console.error('자녀 삭제 에러:', error);
    throw error;
  }
};

/**
 * 기존 단일 자녀 데이터를 children 서브컬렉션으로 마이그레이션하는 함수
 * @returns {Promise<boolean>} 마이그레이션 성공 여부
 */
export const migrateOldChildData = async () => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('로그인이 필요합니다.');

    // 기존 사용자 문서에서 자녀 데이터 확인
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return false;
    }

    const userData = userDoc.data();

    // 기존 자녀 데이터가 있는지 확인
    if (userData.childName && userData.childBirthDate) {
      console.log('기존 자녀 데이터 발견, 마이그레이션 시작...');

      // children 서브컬렉션에 기존 데이터 추가
      const childData = {
        name: userData.childName,
        birthDate: userData.childBirthDate,
        gender: userData.gender || '',
        relationship: userData.relationship || 'child'
      };

      const childId = await addChild(childData);

      // 기존 사용자 문서에서 자녀 관련 필드 삭제
      const updateData = {};
      const fieldsToRemove = ['childName', 'childBirthDate', 'gender', 'relationship'];
      fieldsToRemove.forEach(field => {
        if (userData[field] !== undefined) {
          updateData[field] = null;
        }
      });

      if (Object.keys(updateData).length > 0) {
        await updateDoc(userRef, updateData);
      }

      console.log('마이그레이션 완료:', childId);
      return true;
    }

    return false;
  } catch (error) {
    console.error('마이그레이션 에러:', error);
    throw error;
  }
};

/**
 * 선택된 자녀 ID를 로컬 스토리지에 저장/조회하는 함수들
 */
export const saveSelectedChildId = (childId) => {
  localStorage.setItem('selectedChildId', childId);
};

export const getSelectedChildId = () => {
  return localStorage.getItem('selectedChildId');
};

export const clearSelectedChildId = () => {
  localStorage.removeItem('selectedChildId');
};