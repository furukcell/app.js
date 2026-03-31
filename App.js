import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ImageBackground, Modal, TextInput, Image, Dimensions, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activePage, setActivePage] = useState('Ana Sayfa');
  const [expandedMenu, setExpandedMenu] = useState(null);
  const [seciliSehir, setSeciliSehir] = useState('Milas');

  // --- ANA VERİ SETİ ---
  const [hayvanlar, setHayvanlar] = useState([
    { id: '1', no: 'Paşa', kupe: 'TR48-001', tarih: '01.03.2026', kilo: '250', guncelKilo: '315', fiyat: '75000', toplamYem: '420', saglik: 'SAĞLIKLI ✅', foto: 'https://images.pexels.com/photos/162240/bull-calf-cow-agriculture-162240.jpeg?auto=compress&cs=tinysrgb&w=400' }
  ]);

  const [haftalikKayitlar, setHaftalikKayitlar] = useState([]);
  const [yemAlimlar, setYemAlimlar] = useState([]); 
  const [asiTakvimi, setAsiTakvimi] = useState([]); // Yeni: Aşı Takvimi
  const [saglikSorunlari, setSaglikSorunlari] = useState([]); // Yeni: Sağlık Sorunları
  
  const [raporModal, setRaporModal] = useState(false);
  const [takvimModal, setTakvimModal] = useState(false);
  const [yemEkleModal, setYemEkleModal] = useState(false); 
  const [asiModal, setAsiModal] = useState(false); // Yeni: Aşı Modal
  const [saglikModal, setSaglikModal] = useState(false); // Yeni: Sağlık Durum Modal

  const [seciliHayvanRapor, setSeciliHayvanRapor] = useState(null);
  const [yeniRapor, setYeniRapor] = useState({ tarih: '06.04.2026', kilo: '', besiYemi: '0', saman: '0', silaj: '0', arpa: '0', misir: '0', yonca: '0' });

  // --- VETERİNER STATES ---
  const [yeniAsi, setYeniAsi] = useState({ hayvanId: '', asiTuru: '', tarih: '31.03.2026' });
  const [yeniDurum, setYeniDurum] = useState({ hayvanId: '', durum: 'İştahsız', not: '', tarih: '31.03.2026' });

  // --- YEM ALIM STATE ---
  const [yeniYemAlim, setYeniYemAlim] = useState({ tip: 'Arpa', miktar: '', fiyat: '', tarih: '31.03.2026' });

  // --- MODAL STATES ---
  const [ekleModal, setEkleModal] = useState(false);
  const [duzenleModal, setDuzenleModal] = useState(false);
  const [fotoSecimModal, setFotoSecimModal] = useState(false);
  const [fotoHedef, setFotoHedef] = useState('ekle');
  const [tempHayvan, setTempHayvan] = useState({ no: '', kupe: '', tarih: '', kilo: '', fiyat: '', foto: null });
  const [seciliDuzenle, setSeciliDuzenle] = useState(null);

  const menuItems = [
    { id: 'kontrol', label: 'Kontrol Paneli', icon: 'view-dashboard-outline' },
    { id: 'hayvan', label: 'Hayvan Yönetimi', icon: 'cow', sub: ['Hayvan Ekleme', 'Hayvan Durumu Güncel', 'Haftalık Gelişim Raporu', 'Aylık Gelişim Raporu'] },
    { id: 'yem', label: 'Yem Stok', icon: 'barley', sub: ['Yem Alış', 'Stok Tablosu Güncel'] },
    { id: 'vete', label: 'Veteriner', icon: 'medical-bag', sub: ['Güncel Hayvan Sağlık Durumu', 'Aşı Takvimi'] },
  ];

  // --- HESAPLAMA FONKSİYONLARI ---
  const getHayvanAdi = (id) => hayvanlar.find(h => h.id === id)?.no || "Bilinmiyor";
  const gcaaHesapla = (alis, guncel) => ((parseFloat(guncel) - parseFloat(alis)) / 31).toFixed(2);
  const gcaaRenkGetir = (v) => v < 1 ? '#e74c3c' : v <= 1.5 ? '#f1c40f' : '#2ecc71';

  // --- STOK HESAPLAMA ---
  const getStokDurum = () => {
    const tipler = ['Arpa', 'Saman', 'Silaj', 'Besi Yemi', 'Yonca', 'Misir'];
    return tipler.map(tip => {
      const toplamAlinan = yemAlimlar.filter(a => a.tip.toLowerCase() === tip.toLowerCase()).reduce((acc, curr) => acc + parseFloat(curr.miktar || 0), 0);
      const anahtar = tip === 'Besi Yemi' ? 'besiYemi' : tip.toLowerCase();
      const toplamVerilen = haftalikKayitlar.reduce((acc, curr) => acc + parseFloat(curr[anahtar] || 0), 0);
      return { tip, kalan: toplamAlinan - toplamVerilen };
    });
  };

  const handleRaporKaydet = () => {
    const t = yeniRapor;
    const toplamYemHafta = parseFloat(t.besiYemi||0) + parseFloat(t.saman||0) + parseFloat(t.silaj||0) + parseFloat(t.arpa||0) + parseFloat(t.misir||0) + parseFloat(t.yonca||0);
    const kayit = { ...yeniRapor, hayvanId: seciliHayvanRapor.id, id: Math.random().toString(), toplam: toplamYemHafta };
    setHaftalikKayitlar([...haftalikKayitlar, kayit]);
    setHayvanlar(hayvanlar.map(h => h.id === seciliHayvanRapor.id ? { ...h, guncelKilo: yeniRapor.kilo, toplamYem: (parseFloat(h.toplamYem) + toplamYemHafta).toString() } : h));
    setRaporModal(false);
    setYeniRapor({ tarih: '06.04.2026', kilo: '', besiYemi: '0', saman: '0', silaj: '0', arpa: '0', misir: '0', yonca: '0' });
  };

  const handleHayvanEkle = () => {
    const yeni = { ...tempHayvan, id: Math.random().toString(), guncelKilo: tempHayvan.kilo, toplamYem: '0', saglik: 'SAĞLIKLI ✅' };
    setHayvanlar([yeni, ...hayvanlar]);
    setEkleModal(false);
  };

  const handleYemAlimKaydet = () => {
    if(!yeniYemAlim.miktar || !yeniYemAlim.fiyat) return Alert.alert("Hata", "Lütfen tüm alanları doldurun.");
    setYemAlimlar([ { ...yeniYemAlim, id: Math.random().toString() }, ...yemAlimlar]);
    setYemEkleModal(false);
    setYeniYemAlim({ tip: 'Arpa', miktar: '', fiyat: '', tarih: '31.03.2026' });
  };

  // --- VETERİNER KAYIT FONKSİYONLARI ---
  const handleAsiKaydet = () => {
    if(!yeniAsi.hayvanId || !yeniAsi.asiTuru) return Alert.alert("Hata", "Lütfen hayvan ve aşı türü seçin.");
    setAsiTakvimi([{...yeniAsi, id: Math.random().toString()}, ...asiTakvimi]);
    setAsiModal(false);
    setYeniAsi({ hayvanId: '', asiTuru: '', tarih: '31.03.2026' });
  };

  const handleSaglikKaydet = () => {
    if(!yeniDurum.hayvanId) return Alert.alert("Hata", "Lütfen hayvan seçin.");
    setSaglikSorunlari([{...yeniDurum, id: Math.random().toString()}, ...saglikSorunlari]);
    setSaglikModal(false);
    setYeniDurum({ hayvanId: '', durum: 'İştahsız', not: '', tarih: '31.03.2026' });
  };

  const Sidebar = () => (
    <Modal visible={isMenuOpen} transparent animationType="none">
      <View style={styles.drawerContainer}>
        <View style={styles.drawerWhite}>
          <View style={styles.drawerHeaderWhite}>
            <Image source={{ uri: 'https://i.pravatar.cc/100' }} style={styles.drawerAvatarWhite} />
            <Text style={styles.drawerUserWhite}>Faruk Kurtuluş</Text>
            <Text style={styles.drawerMailWhite}>Milas, Muğla</Text>
          </View>
          <ScrollView>
            {menuItems.map((item) => (
              <View key={item.id} style={styles.menuBox}>
                <TouchableOpacity style={styles.menuLinkWhite} onPress={() => item.sub ? setExpandedMenu(expandedMenu === item.id ? null : item.id) : (setActivePage(item.label), setIsMenuOpen(false))}>
                  <View style={styles.menuIconText}><MaterialCommunityIcons name={item.icon} size={24} color="#27ae60" /><Text style={styles.menuLabelWhite}>{item.label}</Text></View>
                  {item.sub && <MaterialCommunityIcons name={expandedMenu === item.id ? "chevron-up" : "chevron-down"} size={22} color="#95a5a6" />}
                </TouchableOpacity>
                {expandedMenu === item.id && item.sub.map((sub) => (
                  <TouchableOpacity key={sub} style={styles.subMenuLinkWhite} onPress={() => {setActivePage(sub); setIsMenuOpen(false);}}>
                    <Text style={styles.subMenuLabelWhite}>• {sub}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </ScrollView>
        </View>
        <TouchableOpacity style={styles.drawerOverlay} onPress={() => setIsMenuOpen(false)} />
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Sidebar />
      <ImageBackground source={{ uri: 'https://images.pexels.com/photos/462118/pexels-photo-462118.jpeg' }} style={styles.bg}>
        <View style={styles.overlay}>
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => setIsMenuOpen(true)}><MaterialCommunityIcons name="menu" size={35} color="#fff" /></TouchableOpacity>
            <View style={styles.topHava}><Text style={{color:'#fff', fontWeight:'bold'}}>{seciliSehir}: 24°C</Text></View>
          </View>

          <ScrollView style={styles.p15}>
            {activePage === 'Ana Sayfa' || activePage === 'Kontrol Paneli' ? (
              <View>
                <Text style={styles.devBaslik}>KONTROL PANELİ</Text>
                <View style={styles.fotoKart}>
                  <ImageBackground source={{uri: 'https://images.pexels.com/photos/162240/bull-calf-cow-agriculture-162240.jpeg'}} style={styles.cardInnerBg} imageStyle={{borderRadius:30}}>
                    <View style={styles.fotoOverlay}>
                      <Text style={styles.fotoEtiket}>📊 GENEL DURUM</Text>
                      <Text style={styles.fotoDeger}>{hayvanlar.length} BAŞ HAYVAN</Text>
                    </View>
                  </ImageBackground>
                </View>
                <View style={styles.fotoKart}>
                  <ImageBackground source={{uri: 'https://images.pexels.com/photos/259200/pexels-photo-259200.jpeg'}} style={styles.cardInnerBg} imageStyle={{borderRadius:30}}>
                    <View style={styles.fotoOverlay}>
                      <Text style={styles.fotoEtiket}>🌾 YEM STOK</Text>
                      <Text style={styles.fotoDeger}>ARPA: %80 DOLU</Text>
                    </View>
                  </ImageBackground>
                </View>
                <View style={styles.fotoKart}>
                  <ImageBackground source={{uri: 'https://images.pexels.com/photos/7521481/pexels-photo-7521481.jpeg'}} style={styles.cardInnerBg} imageStyle={{borderRadius:30}}>
                    <View style={styles.fotoOverlay}>
                      <Text style={styles.fotoEtiket}>💉 HAYVAN SAĞLIĞI</Text>
                      <Text style={styles.fotoDeger}>{saglikSorunlari.length > 0 ? `${saglikSorunlari.length} SORUNLU KAYIT` : "TÜMÜ SAĞLIKLI"}</Text>
                    </View>
                  </ImageBackground>
                </View>
                <View style={[styles.fotoKart, {marginBottom: 50}]}>
                  <ImageBackground source={{uri: 'https://images.pexels.com/photos/259251/pexels-photo-259251.jpeg'}} style={styles.cardInnerBg} imageStyle={{borderRadius:30}}>
                    <View style={styles.fotoOverlay}>
                      <Text style={styles.fotoEtiket}>💰 FİNANSAL DURUM</Text>
                      <Text style={styles.fotoDeger}>GÜNCEL MALİYET ANALİZİ</Text>
                    </View>
                  </ImageBackground>
                </View>
              </View>
            ) : activePage === 'Aşı Takvimi' ? (
              <View>
                <Text style={styles.sayfaBaslik}>Aşı Takvimi Geçmişi</Text>
                {asiTakvimi.length === 0 ? <Text style={{color: '#fff', textAlign: 'center', marginTop: 20}}>Henüz aşı kaydı bulunmuyor.</Text> :
                  asiTakvimi.map(asi => (
                    <View key={asi.id} style={styles.hayvanKart}>
                      <View style={{backgroundColor: '#3498db', padding: 10, borderRadius: 10, marginRight: 15}}><MaterialCommunityIcons name="needle" size={24} color="#fff" /></View>
                      <View style={{flex: 1}}><Text style={styles.listeIsim}>{getHayvanAdi(asi.hayvanId)}</Text><Text style={styles.listeAlt}>{asi.asiTuru}</Text></View>
                      <Text style={{fontWeight: 'bold', color: '#3498db'}}>{asi.tarih}</Text>
                    </View>
                  ))}
                <TouchableOpacity style={styles.fab} onPress={() => setAsiModal(true)}><MaterialCommunityIcons name="plus" size={35} color="#fff" /></TouchableOpacity>
              </View>
            ) : activePage === 'Güncel Hayvan Sağlık Durumu' ? (
              <View>
                <Text style={styles.sayfaBaslik}>Sağlık Sorunları & Takip</Text>
                {saglikSorunlari.length === 0 ? <Text style={{color: '#fff', textAlign: 'center', marginTop: 20, backgroundColor: 'rgba(46, 204, 113, 0.3)', padding: 15, borderRadius: 15}}>Şu an tüm hayvanlar sağlıklı gözüküyor. ✅</Text> :
                  saglikSorunlari.map(sorun => (
                    <View key={sorun.id} style={styles.hayvanKart}>
                      <View style={{backgroundColor: '#e74c3c', padding: 10, borderRadius: 10, marginRight: 15}}><MaterialCommunityIcons name="alert-circle-outline" size={24} color="#fff" /></View>
                      <View style={{flex: 1}}><Text style={styles.listeIsim}>{getHayvanAdi(sorun.hayvanId)}</Text><Text style={styles.listeAlt}>{sorun.durum} - {sorun.not}</Text></View>
                      <Text style={{fontWeight: 'bold', color: '#e74c3c'}}>{sorun.tarih}</Text>
                    </View>
                  ))}
                <TouchableOpacity style={styles.fab} onPress={() => setSaglikModal(true)}><MaterialCommunityIcons name="plus" size={35} color="#fff" /></TouchableOpacity>
              </View>
            ) : activePage === 'Yem Alış' ? (
              <View>
                <Text style={styles.sayfaBaslik}>Yem Alım Geçmişi</Text>
                {yemAlimlar.length === 0 ? <Text style={{color: '#fff', textAlign: 'center', marginTop: 20}}>Henüz alım kaydı bulunmuyor.</Text> :
                  yemAlimlar.map(alim => (
                    <View key={alim.id} style={styles.hayvanKart}>
                      <View style={{backgroundColor: '#2ecc71', padding: 10, borderRadius: 10, marginRight: 15}}><MaterialCommunityIcons name="calendar-check" size={24} color="#fff" /></View>
                      <View style={{flex: 1}}><Text style={styles.listeIsim}>{alim.tip}</Text><Text style={styles.listeAlt}>{alim.tarih} - {alim.miktar} kg</Text></View>
                      <Text style={{fontWeight: 'bold', color: '#27ae60'}}>{alim.fiyat} TL</Text>
                    </View>
                  ))}
                <TouchableOpacity style={styles.fab} onPress={() => setYemEkleModal(true)}><MaterialCommunityIcons name="plus" size={35} color="#fff" /></TouchableOpacity>
              </View>
            ) : activePage === 'Stok Tablosu Güncel' ? (
              <View>
                <Text style={styles.sayfaBaslik}>Güncel Yem Stoğu</Text>
                <View style={styles.durumKart}>
                  <Text style={[styles.durumIsim, {marginBottom: 15}]}>Depodaki Kalan Miktarlar</Text>
                  <View style={{borderBottomWidth: 1, borderBottomColor: '#eee', marginBottom: 10, flexDirection: 'row', paddingBottom: 5}}>
                    <Text style={{flex: 2, fontWeight: 'bold'}}>Yem Tipi</Text>
                    <Text style={{flex: 1, fontWeight: 'bold', textAlign: 'right'}}>Kalan (kg)</Text>
                  </View>
                  {getStokDurum().map(stok => (
                    <View key={stok.tip} style={{flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: '#f1f1f1'}}>
                      <Text style={{flex: 2, color: '#2c3e50'}}>{stok.tip}</Text>
                      <Text style={{flex: 1, textAlign: 'right', fontWeight: 'bold', color: stok.kalan <= 100 ? '#e74c3c' : '#27ae60'}}>{stok.kalan} kg</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : activePage === 'Hayvan Durumu Güncel' ? (
              <View>
                <Text style={styles.sayfaBaslik}>Güncel Durum</Text>
                {hayvanlar.map(item => {
                  const gcaa = gcaaHesapla(item.kilo, item.guncelKilo);
                  const hastaMi = saglikSorunlari.some(s => s.hayvanId === item.id);
                  return (
                    <View key={item.id} style={styles.durumKart}>
                      <View style={styles.durumUst}>
                        <Image source={{uri: item.foto}} style={styles.durumFoto} />
                        <View style={{marginLeft: 10}}><Text style={styles.durumIsim}>{item.no}</Text><Text style={styles.durumGun}>Besi Günü: 31</Text></View>
                        <View style={[styles.saglikBadge, {backgroundColor: hastaMi ? '#ffeaa7' : '#f1f2f6'}]}><Text style={styles.saglikText}>{hastaMi ? "KONTROLDE ⚠️" : item.saglik}</Text></View>
                      </View>
                      <View style={styles.durumTablo}>
                        <View style={styles.tabloHucre}><Text style={styles.hucreBaslik}>Güncel kg</Text><Text style={styles.hucreDeger}>{item.guncelKilo}</Text></View>
                        <View style={styles.tabloHucre}><Text style={styles.hucreBaslik}>Alınan kg</Text><Text style={[styles.hucreDeger, {color:'#27ae60'}]}>+{parseFloat(item.guncelKilo) - parseFloat(item.kilo)}</Text></View>
                        <View style={styles.tabloHucre}><Text style={styles.hucreBaslik}>Günlük Ort.</Text><Text style={[styles.hucreDeger, {color: gcaaRenkGetir(gcaa)}]}>{gcaa} kg</Text></View>
                      </View>
                    </View>
                  );
                })}
              </View>
            ) : activePage === 'Haftalık Gelişim Raporu' ? (
              <View>
                <Text style={styles.sayfaBaslik}>Haftalık Tartım Takip</Text>
                {hayvanlar.map(item => {
                  const yapildiMi = haftalikKayitlar.some(k => k.hayvanId === item.id);
                  return (
                    <TouchableOpacity key={item.id} style={styles.hayvanKart} onPress={() => {setSeciliHayvanRapor(item); setRaporModal(true);}}>
                      <Image source={{uri: item.foto}} style={styles.listeFoto} />
                      <View style={{marginLeft: 15, flex: 1}}><Text style={styles.listeIsim}>{item.no}</Text><Text style={[styles.listeAlt, {color: yapildiMi ? '#2ecc71' : '#e74c3c'}]}>{yapildiMi ? "Bu hafta tartıldı ✅" : "Tartım: 06.04.2026 (Pzt)"}</Text></View>
                      <TouchableOpacity onPress={() => {setSeciliHayvanRapor(item); setTakvimModal(true);}}><MaterialCommunityIcons name="calendar-month" size={32} color="#2ecc71" /></TouchableOpacity>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : activePage === 'Hayvan Ekleme' ? (
              <View>
                {hayvanlar.map(item => (
                  <TouchableOpacity key={item.id} style={styles.hayvanKart} onPress={() => {setSeciliDuzenle(item); setDuzenleModal(true);}}>
                    <Image source={{uri: item.foto}} style={styles.listeFoto} /><View style={{marginLeft: 15, flex: 1}}><Text style={styles.listeIsim}>{item.no}</Text><Text style={styles.listeAlt}>{item.kupe}</Text></View>
                    <MaterialCommunityIcons name="pencil-circle" size={32} color="#2ecc71" />
                  </TouchableOpacity>
                ))}
                <TouchableOpacity style={styles.fab} onPress={() => setEkleModal(true)}><MaterialCommunityIcons name="plus" size={35} color="#fff" /></TouchableOpacity>
              </View>
            ) : null}
          </ScrollView>
        </View>
      </ImageBackground>

      {/* AŞI MODAL */}
      <Modal visible={asiModal} animationType="slide">
        <SafeAreaView style={styles.formContainer}>
          <View style={styles.formUst}><Text style={styles.formBaslik}>Yeni Aşı Kaydı</Text><TouchableOpacity onPress={() => setAsiModal(false)}><MaterialCommunityIcons name="close" size={30} /></TouchableOpacity></View>
          <ScrollView style={styles.p15}>
            <Text style={styles.label}>Hayvan Seçin</Text>
            <View style={{flexDirection: 'row', flexWrap: 'wrap', marginBottom: 15}}>
              {hayvanlar.map(h => (
                <TouchableOpacity key={h.id} onPress={() => setYeniAsi({...yeniAsi, hayvanId: h.id})} style={{padding: 10, backgroundColor: yeniAsi.hayvanId === h.id ? '#3498db' : '#f1f2f6', borderRadius: 10, marginRight: 5, marginBottom: 5}}>
                  <Text style={{color: yeniAsi.hayvanId === h.id ? '#fff' : '#000'}}>{h.no}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput style={styles.input} placeholder="Aşı Türü (Örn: Şap, Karma)" onChangeText={v => setYeniAsi({...yeniAsi, asiTuru: v})} />
            <TextInput style={styles.input} placeholder="Tarih" value={yeniAsi.tarih} onChangeText={v => setYeniAsi({...yeniAsi, tarih: v})} />
            <TouchableOpacity style={[styles.anaKaydetButon, {backgroundColor: '#3498db'}]} onPress={handleAsiKaydet}><Text style={styles.kaydetYazisi}>AŞIYI KAYDET</Text></TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* SAĞLIK MODAL */}
      <Modal visible={saglikModal} animationType="slide">
        <SafeAreaView style={styles.formContainer}>
          <View style={styles.formUst}><Text style={styles.formBaslik}>Sağlık Sorunu Ekle</Text><TouchableOpacity onPress={() => setSaglikModal(false)}><MaterialCommunityIcons name="close" size={30} /></TouchableOpacity></View>
          <ScrollView style={styles.p15}>
            <Text style={styles.label}>Hayvan Seçin</Text>
            <View style={{flexDirection: 'row', flexWrap: 'wrap', marginBottom: 15}}>
              {hayvanlar.map(h => (
                <TouchableOpacity key={h.id} onPress={() => setYeniDurum({...yeniDurum, hayvanId: h.id})} style={{padding: 10, backgroundColor: yeniDurum.hayvanId === h.id ? '#e74c3c' : '#f1f2f6', borderRadius: 10, marginRight: 5, marginBottom: 5}}>
                  <Text style={{color: yeniDurum.hayvanId === h.id ? '#fff' : '#000'}}>{h.no}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.label}>Belirti / Durum</Text>
            <View style={{flexDirection: 'row', marginBottom: 15}}>
              {['İştahsız', 'Halsiz', 'Öksürük', 'Yaralanma'].map(d => (
                <TouchableOpacity key={d} onPress={() => setYeniDurum({...yeniDurum, durum: d})} style={{padding: 10, backgroundColor: yeniDurum.durum === d ? '#e74c3c' : '#f1f2f6', borderRadius: 10, marginRight: 5}}>
                  <Text style={{color: yeniDurum.durum === d ? '#fff' : '#000', fontSize: 12}}>{d}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput style={styles.input} placeholder="Ek Not (Hangi ilaç kullanıldı vb.)" onChangeText={v => setYeniDurum({...yeniDurum, not: v})} />
            <TextInput style={styles.input} placeholder="Tarih" value={yeniDurum.tarih} onChangeText={v => setYeniDurum({...yeniDurum, tarih: v})} />
            <TouchableOpacity style={[styles.anaKaydetButon, {backgroundColor: '#e74c3c'}]} onPress={handleSaglikKaydet}><Text style={styles.kaydetYazisi}>DURUMU KAYDET</Text></TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* DİĞER MODALLAR (YEM, TARTIM, EKLEME) */}
      <Modal visible={yemEkleModal} animationType="slide">
        <SafeAreaView style={styles.formContainer}>
          <View style={styles.formUst}><Text style={styles.formBaslik}>Yeni Yem Alımı</Text><TouchableOpacity onPress={() => setYemEkleModal(false)}><MaterialCommunityIcons name="close" size={30} /></TouchableOpacity></View>
          <ScrollView style={styles.p15}>
            <Text style={styles.label}>Yem Tipi</Text>
            <View style={{flexDirection: 'row', flexWrap: 'wrap', marginBottom: 15}}>
              {['Saman', 'Silaj', 'Arpa', 'Besi Yemi', 'Yonca', 'Misir'].map(tip => (
                <TouchableOpacity key={tip} onPress={() => setYeniYemAlim({...yeniYemAlim, tip})} style={{padding: 10, backgroundColor: yeniYemAlim.tip === tip ? '#2ecc71' : '#f1f2f6', borderRadius: 10, marginRight: 5, marginBottom: 5}}><Text style={{color: yeniYemAlim.tip === tip ? '#fff' : '#000', fontSize: 12}}>{tip}</Text></TouchableOpacity>
              ))}
            </View>
            <TextInput style={styles.input} placeholder="Miktar (kg)" keyboardType="numeric" onChangeText={v => setYeniYemAlim({...yeniYemAlim, miktar: v})} />
            <TextInput style={styles.input} placeholder="Toplam Fiyat (TL)" keyboardType="numeric" onChangeText={v => setYeniYemAlim({...yeniYemAlim, fiyat: v})} />
            <TouchableOpacity style={styles.anaKaydetButon} onPress={handleYemAlimKaydet}><Text style={styles.kaydetYazisi}>ALIMI KAYDET</Text></TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <Modal visible={takvimModal} transparent><View style={styles.modalMerkez}><View style={styles.takvimPanel}><Text style={styles.formBaslik}>{seciliHayvanRapor?.no} Tartım Geçmişi</Text><ScrollView style={{maxHeight: 300}}>{haftalikKayitlar.filter(k => k.hayvanId === seciliHayvanRapor?.id).map((k, i) => (<View key={i} style={styles.gecmisSatir}><Text style={styles.yemLabel}>Hafta {i+1} ({k.tarih})</Text><Text style={{fontSize: 12, color: '#e67e22'}}>Yem: {k.toplam} kg | Kilo: {k.kilo} kg</Text></View>))}</ScrollView><TouchableOpacity onPress={() => setTakvimModal(false)}><Text style={{color:'red', textAlign:'center', marginTop:15}}>Kapat</Text></TouchableOpacity></View></View></Modal>

      <Modal visible={raporModal} animationType="slide">
        <SafeAreaView style={styles.formContainer}>
          <View style={styles.formUst}><Text style={styles.formBaslik}>Tartım: {seciliHayvanRapor?.no}</Text><TouchableOpacity onPress={() => setRaporModal(false)}><MaterialCommunityIcons name="close" size={30} /></TouchableOpacity></View>
          <ScrollView style={styles.p15}>
            <Text style={styles.label}>Güncel Kilo (kg)</Text>
            <TextInput style={styles.input} keyboardType="numeric" onChangeText={v => setYeniRapor({...yeniRapor, kilo: v})} />
            <View style={styles.yemGrid}>{['besiYemi', 'saman', 'silaj', 'arpa', 'misir', 'yonca'].map(f => (<View key={f} style={styles.yemInputBox}><Text style={styles.yemLabel}>{f.toUpperCase()}</Text><TextInput style={styles.inputSıkısık} keyboardType="numeric" placeholder="0" onChangeText={v => setYeniRapor({...yeniRapor, [f]: v})} /></View>))}</View>
            <TouchableOpacity style={styles.anaKaydetButon} onPress={handleRaporKaydet}><Text style={styles.kaydetYazisi}>KAYDET</Text></TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <Modal visible={ekleModal} animationType="slide">
        <SafeAreaView style={styles.formContainer}>
          <View style={styles.formUst}><Text style={styles.formBaslik}>Yeni Hayvan</Text><TouchableOpacity onPress={() => setEkleModal(false)}><MaterialCommunityIcons name="close" size={30} /></TouchableOpacity></View>
          <ScrollView style={styles.p15}>
            <TouchableOpacity style={styles.fotoAlani} onPress={() => {setFotoHedef('ekle'); setFotoSecimModal(true);}}>{tempHayvan.foto ? <Image source={{uri: tempHayvan.foto}} style={styles.fullFoto}/> : <MaterialCommunityIcons name="camera-plus" size={40} color="#ccc" />}</TouchableOpacity>
            <TextInput style={styles.input} placeholder="İsim" onChangeText={v => setTempHayvan({...tempHayvan, no: v})} />
            <TextInput style={styles.input} placeholder="Küpe No" onChangeText={v => setTempHayvan({...tempHayvan, kupe: v})} />
            <TextInput style={styles.input} placeholder="Alış Kilo" keyboardType="numeric" onChangeText={v => setTempHayvan({...tempHayvan, kilo: v})} />
            <TouchableOpacity style={styles.anaKaydetButon} onPress={handleHayvanEkle}><Text style={styles.kaydetYazisi}>EKLE</Text></TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <Modal visible={fotoSecimModal} transparent animationType="fade">
        <View style={styles.modalMerkez}><View style={styles.takvimPanel}><TouchableOpacity style={styles.menuLinkWhite} onPress={()=> {setTempHayvan({...tempHayvan, foto: 'https://images.pexels.com/photos/154644/pexels-photo-154644.jpeg'}); setFotoSecimModal(false);}}><Text>Kamera Görseli</Text></TouchableOpacity><TouchableOpacity onPress={()=>setFotoSecimModal(false)}><Text style={{color:'red', marginTop:10}}>Kapat</Text></TouchableOpacity></View></View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 }, bg: { flex: 1 }, overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }, p15: { padding: 15 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 40 },
  topHava: { backgroundColor: 'rgba(255,255,255,0.1)', padding: 10, borderRadius: 20 },
  devBaslik: { color: '#fff', fontSize: 32, fontWeight: '900', textAlign: 'center', marginVertical: 30 },
  fotoKart: { height: 160, marginBottom: 20, borderRadius: 30, overflow:'hidden', backgroundColor: '#333' },
  cardInnerBg: { flex: 1, justifyContent: 'flex-end' },
  fotoOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', padding: 25, justifyContent: 'space-between' },
  fotoEtiket: { color: '#2ecc71', fontWeight: 'bold' }, fotoDeger: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  sayfaBaslik: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 20 },
  durumKart: { backgroundColor: '#fff', borderRadius: 25, padding: 20, marginBottom: 15 },
  durumUst: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  durumFoto: { width: 60, height: 60, borderRadius: 15 },
  durumIsim: { fontSize: 18, fontWeight: 'bold' }, durumGun: { color: '#27ae60', fontWeight: 'bold' },
  saglikBadge: { marginLeft: 'auto', backgroundColor: '#f1f2f6', padding: 8, borderRadius: 10 }, saglikText: { fontSize: 10, fontWeight: 'bold' },
  durumTablo: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 15 },
  tabloHucre: { alignItems: 'center' }, hucreBaslik: { fontSize: 10, color: '#7f8c8d' }, hucreDeger: { fontSize: 14, fontWeight: 'bold' },
  hayvanKart: { backgroundColor: 'rgba(255,255,255,0.95)', padding: 15, borderRadius: 20, marginBottom: 12, flexDirection: 'row', alignItems: 'center' },
  listeFoto: { width: 55, height: 55, borderRadius: 15 }, listeIsim: { fontWeight: 'bold', fontSize: 18 }, listeAlt: { fontSize: 12 },
  fab: { position: 'absolute', bottom: 30, right: 10, width: 65, height: 65, borderRadius: 32.5, backgroundColor: '#2ecc71', justifyContent: 'center', alignItems: 'center' },
  drawerContainer: { flex: 1, flexDirection: 'row' }, drawerWhite: { width: width * 0.8, height: height, backgroundColor: '#fff', zIndex: 100 },
  drawerOverlay: { width: width * 0.2, height: height, backgroundColor: 'rgba(0,0,0,0.6)' },
  drawerHeaderWhite: { paddingVertical: 40, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#eee' },
  drawerAvatarWhite: { width: 80, height: 80, borderRadius: 40 }, drawerUserWhite: { fontSize: 20, fontWeight: 'bold', color: '#2c3e50', marginTop: 10 },
  menuBox: { backgroundColor: '#f8f9fa', borderRadius: 15, marginHorizontal: 15, marginBottom: 10, borderWidth: 1, borderColor: '#edf2f7' },
  menuLinkWhite: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 18 },
  menuLabelWhite: { marginLeft: 15, fontSize: 16, fontWeight: '700', color: '#2d3436' },
  subMenuLinkWhite: { paddingLeft: 60, paddingVertical: 12 }, subMenuLabelWhite: { color: '#27ae60', fontSize: 14, fontWeight: '600' },
  formContainer: { flex: 1, backgroundColor: '#fff' }, formUst: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee', alignItems:'center' },
  formBaslik: { fontSize: 16, fontWeight: 'bold' }, input: { backgroundColor: '#f1f2f6', borderRadius: 12, padding: 15, marginBottom: 10 },
  inputSıkısık: { backgroundColor: '#fff', borderRadius: 10, padding: 8, borderWidth: 1, borderColor: '#eee', marginTop: 5 },
  label: { fontSize: 12, color: '#7f8c8d', marginBottom: 5 },
  fotoAlani: { width: 120, height: 120, borderRadius: 25, backgroundColor: '#f1f2f6', alignSelf: 'center', justifyContent: 'center', alignItems: 'center', marginBottom: 20, borderStyle:'dashed', borderWidth:1, borderColor:'#ccc', overflow:'hidden' },
  fullFoto: { width:'100%', height:'100%' }, yemGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  yemInputBox: { width: '48%', marginBottom: 15 }, yemLabel: { fontSize: 10, fontWeight: 'bold', color: '#27ae60' },
  anaKaydetButon: { backgroundColor: '#2ecc71', padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 15 },
  kaydetYazisi: { color: '#fff', fontWeight: 'bold' }, modalMerkez: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  takvimPanel: { backgroundColor: '#fff', padding: 25, borderRadius: 25, width: '90%' }, gecmisSatir: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
  takvimAyGenis: { alignItems: 'center', marginRight: 25, width: 80 }, ayYazi: { fontSize: 10, color: '#7f8c8d' },
  ayKilo: { fontSize: 10, fontWeight: 'bold' }, barContainer: { flexDirection: 'row', alignItems: 'flex-end', height: 100, marginBottom: 5 },
  grafikCubuk: { width: 15, borderRadius: 5, marginHorizontal: 2 }
});
